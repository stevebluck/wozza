import { Schema } from "effect"

export type Token = typeof Token.Type
export const Token = Schema.String.pipe(Schema.brand("Token"))

export class NoSuchToken extends Schema.TaggedError<NoSuchToken>()("NoSuchToken", {}) {}
