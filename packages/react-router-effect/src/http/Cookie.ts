import { Cookies } from "@effect/platform"
import { Effect, Schema } from "effect"
import { ParseError } from "effect/ParseResult"

export type Cookie<A> = {
  parse: (cookie: Cookies.Cookie) => Effect.Effect<A, ParseError>
  serialize: (value: A) => Effect.Effect<Cookies.Cookie, ParseError>
  name: string
}

export const make = <A>(
  name: string,
  schema: Schema.Schema<A, string>,
  options?: Cookies.Cookie["options"]
): Cookie<A> => {
  const encode = Schema.encode(schema)
  const decode = Schema.decode(schema)

  const serialize = (value: A): Effect.Effect<Cookies.Cookie, ParseError> =>
    encode(value).pipe(Effect.map((value) => Cookies.unsafeMakeCookie(name, value, options)))

  const parse = (cookie: Cookies.Cookie): Effect.Effect<A, ParseError> => decode(cookie.value)

  return {
    parse,
    serialize,
    name
  }
}

// TODO: Add makeEncryptedCookie
