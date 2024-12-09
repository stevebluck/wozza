import { Duration, Effect } from "effect"
import { Token } from "@wozza/domain"

export interface Tokens<A> {
  issue: (value: A, timeToLive: Duration.Duration) => Effect.Effect<Token<A>>

  lookup: (token: Token<A>) => Effect.Effect<A, Token.NoSuchToken>

  findByValue: (a: A) => Effect.Effect<Array<Token<A>>>

  revoke: (token: Token<A>) => Effect.Effect<void>

  revokeMany: (tokens: Array<Token<A>>) => Effect.Effect<void>

  revokeAll: (value: A) => Effect.Effect<void>
}
