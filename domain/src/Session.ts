import { Schema } from "effect"
import { Token } from "./Token"
import { User } from "./User"
import { Id, Identified } from "@wozza/prelude"

export class Session extends Schema.Class<Session>("Session")({
  token: Token.schema<Id<User>>(),
  user: Identified.schema(User)
}) {}
