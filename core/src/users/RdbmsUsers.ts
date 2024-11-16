import { Users, User } from "./Users"
import { Effect } from "effect"
import { NoSuchToken, Token } from "../tokens/Tokens"

export class RdbmsUsers implements Users {
  static make = Effect.gen(function* () {
    return new RdbmsUsers()
  })

  identify = (token: Token): Effect.Effect<User, NoSuchToken> => Effect.succeed(User.make({ name: "Steve" }))
}
