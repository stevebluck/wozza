import { Cookies, Cookies as PlatformCookies } from "@effect/platform"
import { Duration, Effect, Redacted, Schema } from "effect"
import { ParseError } from "effect/ParseResult"
import { createCookie } from "react-router"

export type Settings<A, R> = PlatformCookies.Cookie["options"] & {
  name: string
  schema: Schema.Schema<A, string, R>
  secrets?: Array<Redacted.Redacted<string>>
}

export interface Cookie<A, R = never> {
  parse: (value: string) => Effect.Effect<A, ParseError, R>
  serialize: (value: A) => Effect.Effect<string, ParseError, R>
  unset: Effect.Effect<string>
  settings: Settings<A, R>
}

export const make = <A, R = never>(settings: Settings<A, R>): Cookie<A, R> => {
  const { name, schema, ...options } = settings

  const annotated = schema.pipe(Schema.annotations({ identifier: `cookie(${name})` }))

  const encode = Schema.encode(annotated)
  const decode = Schema.decode(annotated)

  const optionsSecrets = options?.secrets || []
  const secrets = optionsSecrets.map(Redacted.value)

  const rrCookie = createCookie(name, {
    ...options,
    secrets,
    maxAge: options?.maxAge ? Duration.toSeconds(options.maxAge) : undefined,
    secure: options?.secure
  })

  const serialize = (value: A) => {
    return encode(value).pipe(
      Effect.andThen((value) => rrCookie.serialize(value)),
      Effect.catchTags({ UnknownException: Effect.die })
    )
  }

  const parse = (value: string) =>
    Cookies.makeCookie(settings.name, value, settings).pipe(
      Effect.map((cookie) => Cookies.toCookieHeader(Cookies.fromIterable([cookie]))),
      Effect.andThen(rrCookie.parse),
      Effect.catchTags({ UnknownException: Effect.die, CookieError: Effect.die }),
      Effect.flatMap(decode)
    )

  const unset = Effect.promise(() => rrCookie.serialize({}, { ...options, maxAge: 0 }))

  return {
    parse,
    serialize,
    unset,
    settings
  }
}
