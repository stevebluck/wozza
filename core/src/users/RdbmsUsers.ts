import { Users, UsersSymbol } from "./Users"
import { Array, DateTime, Effect, Layer, Option, Schema } from "effect"
import { Id, Identified, refineErrorOrDie } from "@wozza/prelude"
import { SqlClient, SqlError } from "@effect/sql"
import { Database } from "../persistence/Database"
import {
  Credentials,
  CredentialsAlreadyExist,
  Email,
  InvalidCredentials,
  Session,
  Token,
  User,
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
    const query = this.sql<DbUser & { session_id: string; expires_at: Date }>`
      SELECT u.*, s.id as session_id, s.expires_at
      FROM ${this.sql(DbSession.table)} s
      INNER JOIN ${this.sql(DbUser.table)} u ON u.id = s.user_id
      WHERE s.id = ${token.value}
      LIMIT 1; 
    `

    return query.pipe(
      Effect.orDie,
      Effect.flatMap(Array.head),
      Effect.map((res) => Session.make({ user: DbUser.toUser(res), token: Token.make<Id<User>>(res.session_id) })),
      Effect.mapError(() => new Token.NoSuchToken())
    )
  }

  authenticate = (credentials: Credentials): Effect.Effect<Session, InvalidCredentials> => {
    return Effect.gen(this, function* () {
      const now = yield* DateTime.now
      const expiresAt = DateTime.add(now, { days: 2 })
      const query = yield* this.sql<DbUser & { session_id: string }>`
        WITH user_auth AS (
          SELECT * FROM ${this.sql(DbUser.table)}
          WHERE email = ${credentials.email}
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

      return Session.make({ user: DbUser.toUser(result), token: Token.make<Id<User>>(result.session_id) })
    })
  }

  logout = (token: Token<Id<User>>): Effect.Effect<void> => {
    return this.sql`DELETE FROM ${this.sql(DbSession.table)} WHERE id = ${token.value}`.pipe(Effect.ignoreLogged)
  }

  register = (credentials: Credentials): Effect.Effect<Session, CredentialsAlreadyExist> => {
    const tx = Effect.gen(this, function* () {
      const now = yield* DateTime.now
      const expiresAt = DateTime.add(now, { days: 2 })

      const userResults = yield* this
        .sql<DbUser>`INSERT INTO ${this.sql(DbUser.table)} (email, first_name, last_name, picture) VALUES (
          ${credentials.email}, 
          ${Option.getOrNull(credentials.firstName)}, 
          ${Option.getOrNull(credentials.lastName)}, 
          ${Option.getOrNull(credentials.picture)}
        ) RETURNING id;`

      const user = Identified.make(
        User.make({
          email: credentials.email,
          firstName: credentials.firstName,
          lastName: credentials.lastName,
          picture: credentials.picture
        }),
        Id.make(userResults[0].id)
      )

      const session = yield* this.sql<DbSession>`INSERT INTO ${this.sql(DbSession.table)} (user_id, expires_at) VALUES (
        ${user.id.value},
        ${DateTime.toDate(expiresAt)}
      ) RETURNING id;`

      return Session.make({ user, token: Token.make<Id<User>>(session[0].id) })
    })

    return this.sql.withTransaction(tx).pipe(
      refineErrorOrDie((e) => {
        if (DatabaseError.isUniqueConstraintError(e)) {
          return Option.some(new CredentialsAlreadyExist())
        }
        return Option.none()
      }),
      Effect.tap(Effect.log)
    )
  }
}

class DbUser extends Schema.Class<DbUser>("DbUser")({
  id: Schema.String,
  email: Schema.String,
  first_name: Schema.NullOr(Schema.String),
  last_name: Schema.NullOr(Schema.String),
  picture: Schema.NullOr(Schema.String),
  created_at: Schema.DateFromSelf,
  updated_at: Schema.DateFromSelf
}) {
  static table = "wozza.users"

  static toUser = (user: DbUser): Identified<User> => {
    return Identified.make(
      User.make({
        email: Email.make(user.email),
        firstName: Option.fromNullable(user.first_name).pipe(Option.map(FirstName.make)),
        lastName: Option.fromNullable(user.last_name).pipe(Option.map(LastName.make)),
        picture: Option.fromNullable(user.picture).pipe(Option.map(Picture.make))
      }),
      Id.make<User>(user.id)
    )
  }
}

class DbSession extends Schema.Class<DbSession>("DbSession")({
  id: Schema.String,
  user_id: Schema.String,
  created_at: Schema.DateFromSelf,
  expires_at: Schema.DateFromSelf
}) {
  static table = "wozza.user_sessions"
}

namespace DatabaseError {
  export const UniqueConstraintError = Schema.Struct({
    code: Schema.Literal("23505"),
    table_name: Schema.String,
    constraint_name: Schema.String
  })

  export const isUniqueConstraintError = (e: SqlError.SqlError) => Schema.is(UniqueConstraintError)(e.cause)
}
