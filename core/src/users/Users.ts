import { Effect, Schema } from "effect"
import { NoSuchToken, Token } from "../tokens/Tokens"

export interface Users {
  identify: (token: Token) => Effect.Effect<User, NoSuchToken>
}

export class User extends Schema.Class<User>("User")({
  name: Schema.String
}) {}
