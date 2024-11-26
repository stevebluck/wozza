import { Users, User } from "./Users"
import { Duration, Effect, Either, HashMap, Option, Ref } from "effect"
import { Token, Tokens } from "../tokens/Tokens"
import { Session } from "../sessions/Session"
import { Id, Identified } from "@wozza/prelude"
import { Email } from "../emails/Email"
import { Credentials, CredentialsAlreadyExist, InvalidCredentials } from "../sessions/Credentials"
import { ReferenceTokens } from "../tokens/ReferenceTokens"

export class ReferenceUsers implements Users {
  static make: Effect.Effect<Users> = Effect.gen(function* () {
    const userTokens = yield* ReferenceTokens.make<Id<User>>()
    const state = yield* Ref.make(State.empty())
    return new ReferenceUsers(state, userTokens)
  })

  private constructor(
    private readonly state: Ref.Ref<State>,
    private readonly userTokens: Tokens<Id<User>>
  ) {}

  register = (credentials: Credentials): Effect.Effect<Session, CredentialsAlreadyExist> => {
    return Ref.modify(this.state, (state) => state.register(credentials)).pipe(
      Effect.flatten,
      Effect.flatMap(this.issueToken)
    )
  }

  identify = (token: Token<Id<User>>): Effect.Effect<Session, Token.NoSuchToken> => {
    return this.userTokens.lookup(token).pipe(
      Effect.flatMap((user) => this.state.get.pipe(Effect.flatMap((state) => state.findById(user)))),
      Effect.map((user) => Session.make({ token, user })),
      Effect.mapError(() => new Token.NoSuchToken())
    )
  }

  authenticate = (credentials: Credentials): Effect.Effect<Session, InvalidCredentials> => {
    return this.state.get.pipe(
      Effect.flatMap((state) => state.findByEmail(credentials.email)),
      Effect.flatMap(this.issueToken),
      Effect.mapError(() => new InvalidCredentials())
    )
  }

  logout = (token: Token<Id<User>>): Effect.Effect<void> => {
    return this.userTokens.revoke(token)
  }

  private issueToken = (user: Identified<User>): Effect.Effect<Session> => {
    return this.userTokens.issue(user.id, Duration.days(30)).pipe(Effect.map((token) => Session.make({ token, user })))
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
