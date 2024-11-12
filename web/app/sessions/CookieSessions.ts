import { Config, Context, Effect, Layer, Schema } from "effect"
import { RequestSession, SessionState } from "./RequestSession"
import { Cookie, Handler, HttpRequest, HttpResponse } from "@wozza/react-router-effect"
import { Session, Sessions } from "./Sessions"
import { ConfigError } from "effect/ConfigError"

// SessionStorage<T>
// CookieSessionStorage<T>
// DatabaseSessionStorage<T>
// CustomSessionStorage<T>

// Sessions<Session>
// -> const storage = yield* SessionStorage
// -> const sessions = yield* storage.createSessions(request)
// -> const result = yield* handler.pipe(provideService(Sessions, sessions))
// -> yield* storage.save(request, result)
// -> return result
// SessionStorage<Session>

export const middleware =
  <SA, SI extends string>(schema: Schema.Schema<SA, SI>) =>
  <A, E, R>(handler: Handler.Handler<A, E, R>) =>
    Effect.gen(function* () {
      const cookie = yield* Cookie.make("wozza_session", schema)

      const sessionState: SessionState<SA> = yield* HttpRequest.getCookieHeader.pipe(
        Effect.zipRight(HttpRequest.parseCookie(cookie)),
        Effect.map((session) => SessionState.Provided({ value: session })),
        Effect.catchTags({
          CookieHeaderNotFound: () => Effect.succeed(SessionState.NotProvided()),
          ParseError: () => Effect.succeed(SessionState.InvalidToken()),
          CookieError: () => Effect.succeed(SessionState.NotProvided())
        })
      )

      const sessions = yield* RequestSession.make(sessionState)
      const result = yield* handler.pipe(Effect.provideService(Sessions, sessions))
      const session = yield* sessions.get

      yield* SessionState.$match(session, {
        Set: (s) => HttpResponse.setCookie(cookie, s.value),
        Unset: () => HttpResponse.unsetCookie(cookie),
        NotProvided: () => Effect.void,
        Provided: () => Effect.void,
        InvalidToken: () => HttpResponse.unsetCookie(cookie)
      })

      return result
    })

export class SessionCookie extends Context.Tag("SessionCookie")<SessionCookie, Cookie.Cookie<any>>() {
  static layer = <A, I extends string>(
    options: Config.Config.Wrap<Cookie.Options>,
    schema: Schema.Schema<A, I>
  ): Layer.Layer<SessionCookie, ConfigError> =>
    Layer.unwrapEffect(
      Effect.gen(function* () {
        const config = yield* Config.unwrap(options)
        const cookie = yield* Cookie.make("wozza_session", schema, config)
        return Layer.succeed(SessionCookie, cookie)
      })
    )
}
