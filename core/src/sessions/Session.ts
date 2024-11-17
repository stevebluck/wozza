import { Schema } from "effect"
import { Token } from "../tokens/Tokens"
import { User } from "../users/Users"
import { Id, Identified } from "@wozza/prelude"

export class Session extends Schema.Class<Session>("Session")({
  token: Token.schema<Id<User>>(),
  user: Identified.schema(User)
}) {}
