import { Users, User } from "./Users"
import { Effect, Either, HashMap, Option, Ref } from "effect"
import { Token } from "../tokens/Tokens"
import { Session } from "../sessions/Session"
import { Id, Identified } from "@wozza/prelude"
import { Email } from "../emails/Email"
import { Credentials, CredentialsAlreadyExist, InvalidCredentials } from "../sessions/Credentials"

export class ReferenceUsers implements Users {
  static make = Effect.gen(function* () {
    const state = yield* Ref.make(State.empty())
    return new ReferenceUsers(state)
  })

  constructor(private readonly state: Ref.Ref<State>) {}

  register = (credentials: Credentials): Effect.Effect<Session, CredentialsAlreadyExist> => {
    return Ref.modify(this.state, (state) => state.register(credentials)).pipe(
      Effect.flatten,
      Effect.map((user) => Session.make({ token: Token.make<Id<User>>(user.id.value), user }))
    )
  }

  identify = (token: Token<Id<User>>): Effect.Effect<Session, Token.NoSuchToken> => {
    return this.state.get.pipe(
      Effect.flatMap((state) => state.findById(Id.make(token.value))),
      Effect.map((user) => Session.make({ token: Token.make<Id<User>>(user.id.value), user })),
      Effect.mapError(() => new Token.NoSuchToken())
    )
  }

  authenticate = (credentials: Credentials): Effect.Effect<Session, InvalidCredentials> => {
    return this.state.get.pipe(
      Effect.flatMap((state) => state.findByEmail(credentials.email)),
      Effect.map((user) => Session.make({ token: Token.make<Id<User>>(user.id.value), user })),
      Effect.mapError(() => new InvalidCredentials())
    )
  }

  logout = (token: Token<Id<User>>): Effect.Effect<void> => {
    // invalidate token
    return Effect.void
  }
}

class State {
  static empty = () => new State(HashMap.empty(), HashMap.empty(), 0)

  constructor(
    private readonly byId: HashMap.HashMap<Id<User>, Identified<User>>,
    private readonly byEmail: HashMap.HashMap<Email, Id<User>>,
    private readonly nextId: number
  ) {}

  register = (credentials: Credentials): [Either.Either<Identified<User>, CredentialsAlreadyExist>, State] => {
    const found = HashMap.get(this.byEmail, credentials.email)

    if (Option.isSome(found)) {
      return [Either.left(new CredentialsAlreadyExist()), this]
    }

    const user = Identified.make(
      User.make({
        email: credentials.email,
        firstName: credentials.firstName,
        lastName: credentials.lastName,
        picture: credentials.picture
      }),
      Id.make(this.nextId.toString())
    )

    const byId = HashMap.set(this.byId, user.id, user)
    const byEmail = HashMap.set(this.byEmail, user.value.email, user.id)

    return [Either.right(user), new State(byId, byEmail, this.nextId + 1)]
  }

  findById = (id: Id<User>): Option.Option<Identified<User>> => {
    return HashMap.get(this.byId, id)
  }

  findByEmail = (email: Email): Option.Option<Identified<User>> => {
    return HashMap.get(this.byEmail, email).pipe(Option.flatMap(this.findById))
  }
}
