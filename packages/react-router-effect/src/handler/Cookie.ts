import { Cookies } from "@effect/platform"
import { Duration, Effect, Redacted, Schema } from "effect"
import { ParseError } from "effect/ParseResult"
import { createCookie } from "react-router"

export type Cookie<A> = {
  name: string
  parse: (cookie: Cookies.Cookie) => Effect.Effect<A, ParseError>
  serialize: (value: A) => Effect.Effect<Cookies.Cookie, ParseError>
  unset: Effect.Effect<Cookies.Cookie>
  options: Cookies.Cookie["options"]
}

export const make = <A, I extends string>(
  name: string,
  schema: Schema.Schema<A, I>,
  options?: Options
): Effect.Effect<Cookie<A>> => {
  return Effect.gen(function* () {
    const annotated = schema.pipe(Schema.annotations({ identifier: `cookie(${name})` }))

    const encode = Schema.encode(annotated)
    const decode = Schema.decode(annotated)

    const optionsSecrets = options?.secrets || []
    const secrets = optionsSecrets.map(Redacted.value)

    const opts = {
      ...options,
      maxAge: options?.maxAge ? Duration.toSeconds(options.maxAge) : undefined,
      secrets,
      secure: options?.secure
    }

    const cookie = createCookie(name, opts)

    const serialize = (value: A) => {
      return encode(value).pipe(
        Effect.andThen((value) => cookie.serialize(value)),
        Effect.map((value) => Cookies.fromSetCookie(value)),
        Effect.flatMap(Cookies.get(name)),
        Effect.catchTags({
          NoSuchElementException: Effect.die,
          UnknownException: Effect.die
        })
      )
    }

    const parse = (c: Cookies.Cookie) =>
      Effect.promise(() => cookie.parse(`${name}=${c.value}`) as Promise<I>).pipe(
        Effect.orDie,
        Effect.flatMap((value) => decode(value))
      )

    const unset = Effect.promise(() => cookie.serialize({}, { ...opts, maxAge: 0 })).pipe(
      Effect.map((value) => Cookies.fromSetCookie(value)),
      Effect.flatMap(Cookies.get(name)),
      Effect.orDie
    )

    return {
      parse,
      serialize,
      unset,
      name,
      options
    }
  })
}

export type Options = Cookies.Cookie["options"] & { secrets?: Array<Redacted.Redacted<string>> }
