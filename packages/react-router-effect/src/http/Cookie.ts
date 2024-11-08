import { Cookies } from "@effect/platform"
import { Array, Config, Context, Duration, Effect, Layer, Redacted, Schema } from "effect"
import { ParseError } from "effect/ParseResult"
import { createCookie } from "react-router"

export type Cookie<A> = {
  name: string
  parse: (cookie: Cookies.Cookie) => Effect.Effect<A, ParseError>
  serialize: (value: A) => Effect.Effect<Cookies.Cookie, ParseError>
  schema: Schema.Schema<A, string>
}

export const make = <A>(
  name: string,
  schema: Schema.Schema<A, string>,
  options?: Options
): Effect.Effect<Cookie<A>, never, CookieConfig> =>
  Effect.gen(function* () {
    const config = yield* CookieConfig

    const annotated = schema.pipe(Schema.annotations({ identifier: `cookie(${name})` }))

    const encode = Schema.encode(annotated)
    const decode = Schema.decode(annotated)

    const optionsSecrets = Array.fromNullable(options?.secrets)
    const configSecrets = Array.fromNullable(config.secrets)
    const secrets = Array.flatten(Array.prependAll(configSecrets, optionsSecrets)).map(Redacted.value)

    const opts = {
      ...options,
      maxAge: options?.maxAge ? Duration.toSeconds(options.maxAge) : undefined,
      secrets,
      secure: config.secure || options?.secure
    }

    const cookie = createCookie(name, opts)

    const serialize = (value: A): Effect.Effect<Cookies.Cookie, ParseError> => {
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

    const parse = (c: Cookies.Cookie): Effect.Effect<A, ParseError> =>
      Effect.promise(() => cookie.parse(`${name}=${c.value}`) as Promise<string>).pipe(
        Effect.orDie,
        Effect.flatMap((value) => decode(value))
      )

    return {
      parse,
      serialize,
      schema,
      name
    }
  })

export type Options = Cookies.Cookie["options"] & { secrets?: Array<Redacted.Redacted<string>> }

export class CookieConfig extends Context.Tag("CookieConfig")<CookieConfig, Options>() {
  static layerConfig = (_: Config.Config.Wrap<Options>) => Layer.effect(this, Config.unwrap(_))
  static default = Layer.succeed(CookieConfig, { secrets: [], secure: false })
}
