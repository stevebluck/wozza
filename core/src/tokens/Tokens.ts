import { Data, Duration, Effect, Schema } from "effect"
import { Phantom } from "@wozza/prelude"

export interface Tokens<A> {
  issue: (value: A, timeToLive: Duration.Duration) => Effect.Effect<Token<A>>

  lookup: (token: Token<A>) => Effect.Effect<A, Token.NoSuchToken>

  findByValue: (a: A) => Effect.Effect<Array<Token<A>>>

  revoke: (token: Token<A>) => Effect.Effect<void>

  revokeMany: (tokens: Array<Token<A>>) => Effect.Effect<void>

  revokeAll: (value: A) => Effect.Effect<void>
}

export interface Token<A> extends Phantom<A, string, "Token"> {}

export namespace Token {
  export const schema = <A>() => Phantom.schema<Token<A>>(Schema.String)

  export const make = <A>(value: string): Token<A> => Phantom.make<Token<A>>()(value)

  export class NoSuchToken extends Data.TaggedError("NoSuchToken") {}
}
