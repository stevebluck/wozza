import { Users, User } from "./Users"
import { Effect } from "effect"
import { NoSuchToken, Token } from "../tokens/Tokens"

export class ReferenceUsers implements Users {
  static make = Effect.gen(function* () {
    return new ReferenceUsers()
  })

  identify = (token: Token): Effect.Effect<User, NoSuchToken> => Effect.succeed(User.make({ name: "Steve" }))
}
