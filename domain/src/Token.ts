import { Data, Schema } from "effect"
import { Phantom } from "@wozza/prelude"

export interface Token<A> extends Phantom<A, string, "Token"> {}

export namespace Token {
  export const schema = <A>() => Phantom.schema<Token<A>>(Schema.String)

  export const make = <A>(value: string): Token<A> => Phantom.make<Token<A>>()(value)

  export class NoSuchToken extends Data.TaggedError("NoSuchToken") {}
}
