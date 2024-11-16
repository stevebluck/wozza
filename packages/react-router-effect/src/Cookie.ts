import { Cookies as PlatformCookies } from "@effect/platform"
import { Duration, Effect, Redacted, Schema } from "effect"
import { ParseError } from "effect/ParseResult"
import { createCookie } from "react-router"

export type Settings<A, R> = PlatformCookies.Cookie["options"] & {
  name: string
  schema: Schema.Schema<A, string, R>
  secrets?: Array<Redacted.Redacted<string>>
}

export interface Cookie<A, R = never> {
  parse: (cookie: PlatformCookies.Cookie) => Effect.Effect<A, ParseError, R>
  serialize: (value: A) => Effect.Effect<PlatformCookies.Cookie, ParseError, R>
  unset: Effect.Effect<PlatformCookies.Cookie>
  settings: Settings<A, R>
}

export const make = <A, R = never>(settings: Settings<A, R>): Effect.Effect<Cookie<A, R>> => {
  return Effect.gen(function* () {
    const { name, schema, ...options } = settings

    const annotated = schema.pipe(Schema.annotations({ identifier: `cookie(${name})` }))

    const encode = Schema.encode(annotated)
    const decode = Schema.decode(annotated)

    const optionsSecrets = options?.secrets || []
    const secrets = optionsSecrets.map(Redacted.value)

    const cookie = createCookie(name, {
      ...options,
      secrets,
      maxAge: options?.maxAge ? Duration.toSeconds(options.maxAge) : undefined,
      secure: options?.secure
    })

    const serialize = (value: A) => {
      return encode(value).pipe(
        Effect.andThen((value) => cookie.serialize(value)),
        Effect.map(PlatformCookies.fromSetCookie),
        Effect.flatMap(PlatformCookies.get(name)),
        Effect.catchTags({
          NoSuchElementException: Effect.die,
          UnknownException: Effect.die
        })
      )
    }

    const parse = (c: PlatformCookies.Cookie) =>
      Effect.promise(() => cookie.parse(`${name}=${c.value}`) as Promise<string>).pipe(
        Effect.orDie,
        Effect.flatMap(decode)
      )

    const unset = Effect.promise(() => cookie.serialize({}, { ...options, maxAge: 0 })).pipe(
      Effect.map(PlatformCookies.fromSetCookie),
      Effect.flatMap(PlatformCookies.get(name)),
      Effect.orDie
    )

    return {
      parse,
      serialize,
      unset,
      name,
      settings
    }
  })
}
