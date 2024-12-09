import { Users, UsersSymbol } from "./Users"
import { Array, Console, DateTime, Effect, Layer, Option, Schema } from "effect"
import { Id, refineErrorOrDie } from "@wozza/prelude"
import { SqlClient, SqlError, SqlResolver } from "@effect/sql"
import { Database } from "../persistence/Database"
import {
  CredentialsAlreadyExist,
  Email,
  InvalidCredentials,
  Session,
  Token,
  User,
  Password,
  FirstName,
  LastName,
  Picture
} from "@wozza/domain"

export class RdbmsUsers implements Users {
  static make: Effect.Effect<Users, never, SqlClient.SqlClient> = Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient
    return new RdbmsUsers(sql)
  })

  static layer = Layer.effect(Users, RdbmsUsers.make).pipe(Layer.provide(Database))

  private constructor(private readonly sql: SqlClient.SqlClient) {}

  _: typeof UsersSymbol = UsersSymbol

  identify = (token: Token<Id<User>>): Effect.Effect<Session, Token.NoSuchToken> => {
    const query = this.sql<DbUser & { session_id: string }>`
      SELECT u.*, s.id as session_id, s.expires_at
      FROM ${this.sql(DbSession.table)} s
      INNER JOIN ${this.sql(DbUser.table)} u ON u.id = s.user_id
      WHERE s.id = ${token.value}
      LIMIT 1; 
  `
    return query.pipe(
      Effect.orDie,
      Effect.flatMap(Array.head),
      Effect.mapError(() => new Token.NoSuchToken()),
      Effect.flatMap(DbSession.toDomain),
      Effect.provideService(SqlClient.SqlClient, this.sql)
    )
  }

  authenticate = (email: Email, password: Password.Plaintext): Effect.Effect<Session, InvalidCredentials> => {
    return Effect.gen(this, function* () {
      const now = yield* DateTime.now
      const expiresAt = DateTime.add(now, { days: 2 })
      const query = yield* this.sql<DbUser & { session_id: string }>`
        WITH user_auth AS (
          SELECT * FROM ${this.sql(DbUser.table)}
          WHERE email = ${email}
        ),
        new_session AS (
          INSERT INTO ${this.sql(DbSession.table)} (user_id, expires_at)
          SELECT id, ${DateTime.toDate(expiresAt)}
          FROM user_auth
          RETURNING id as session_id, expires_at
        )
        SELECT u.*, s.session_id, s.expires_at
        FROM user_auth u
        INNER JOIN new_session s ON true;
      `.pipe(Effect.orDie)

      const result = yield* Array.head(query).pipe(Effect.mapError((e) => new InvalidCredentials()))

      return yield* DbSession.toDomain(result)
    })
  }

  logout = (token: Token<Id<User>>): Effect.Effect<void> => {
    return this.sql`DELETE FROM ${this.sql(DbSession.table)} WHERE id = ${token.value}`.pipe(Effect.ignoreLogged)
  }

  register = (email: Email, password: Password.Strong): Effect.Effect<Session, CredentialsAlreadyExist> => {
    const tx = Effect.gen(this, function* () {
      const now = yield* DateTime.now
      const expiresAt = DateTime.add(now, { days: 2 })

      const userResults = yield* this.sql<DbUser>`INSERT INTO ${this.sql(DbUser.table)} (email) VALUES (
          ${email}
        ) RETURNING *;`

      const user = userResults[0]

      const session = yield* this.sql<DbSession>`INSERT INTO ${this.sql(DbSession.table)} (user_id, expires_at) VALUES (
        ${user.id},
        ${DateTime.toDate(expiresAt)}
      ) RETURNING id;`

      return yield* DbSession.toDomain({ ...user, session_id: session[0].id })
    })

    return this.sql.withTransaction(tx).pipe(
      refineErrorOrDie((e) => {
        if (DatabaseError.isUniqueConstraintError(e)) {
          return Option.some(new CredentialsAlreadyExist())
        }
        return Option.none()
      })
    )
  }
}

type DbUser = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  picture: string | null
  created_at: Date
  updated_at: Date
}

type DbSession = {
  id: string
  user_id: string
  expires_at: Date
}

namespace DbUser {
  export const table = "wozza.users"
}

namespace DbSession {
  export const table = "wozza.user_sessions"

  const decodedSession = Schema.decode(Session)

  export const toDomain = (user: DbUser & { session_id: string }): Effect.Effect<Session> =>
    decodedSession({
      user: {
        id: user.id,
        value: {
          email: user.email,
          firstName: Option.fromNullable(user.first_name),
          lastName: Option.fromNullable(user.last_name),
          picture: Option.fromNullable(user.picture)
        }
      },
      token: user.session_id
    }).pipe(
      Effect.tapError((err) => Effect.logError("failed to parse session from database", err)),
      Effect.orDie
    )
}

namespace DatabaseError {
  export const UniqueConstraintError = Schema.Struct({
    code: Schema.Literal("23505"),
    table_name: Schema.String,
    constraint_name: Schema.String
  })

  export const isUniqueConstraintError = (e: SqlError.SqlError) => Schema.is(UniqueConstraintError)(e.cause)
}

const IdentifyResolver = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient

  return yield* SqlResolver.findById("FindUserById", {
    Id: Session.fields.token,
    Result: Schema.Struct({
      id: Id.schema<User>(),
      session_id: Session.fields.token,
      expires_at: Schema.DateFromSelf,
      email: Email,
      first_name: Schema.OptionFromNullOr(FirstName),
      last_name: Schema.OptionFromNullOr(LastName),
      picture: Schema.OptionFromNullOr(Picture),
      created_at: Schema.DateFromSelf,
      updated_at: Schema.DateFromSelf
    }),
    ResultId: (result) => result.session_id,
    execute: (ids) => sql`
      SELECT u.*, s.id as session_id, s.expires_at
      FROM ${sql(DbSession.table)} s
      INNER JOIN ${sql(DbUser.table)} u ON u.id = s.user_id
      WHERE s.id id IN ${sql.in(ids)}
      LIMIT 1; 
    `
  })
})
