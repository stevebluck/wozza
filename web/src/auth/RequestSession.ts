import { Cookie, HttpResponse, Middleware } from "@wozza/react-router-effect"
import { Array, Config, Effect } from "effect"
import { Users } from "@wozza/core"
import { Id } from "@wozza/prelude"
import { HttpServerRequest } from "@effect/platform"
import { SessionState, Sessions } from "./Sessions"
import { Token, User } from "@wozza/domain"

export class RequestSession extends Effect.Service<RequestSession>()("@app/RequestSession", {
  effect: Effect.gen(function* () {
    const users = yield* Users

    const cookie = Cookie.make({
      name: "_session",
      maxAge: "30 days",
      path: "/",
      schema: Token.schema<Id<User>>(),
      httpOnly: true,
      secrets: yield* Config.withDefault(Config.array(Config.redacted("SESSION_SECRETS")), Array.empty()),
      secure: yield* Config.string("NODE_ENV").pipe(Config.map((env) => env === "production"))
    })

    return {
      createSession: Effect.gen(function* () {
        const request = yield* HttpServerRequest.HttpServerRequest

        return yield* Effect.fromNullable(request.cookies[cookie.settings.name]).pipe(
          Effect.flatMap((value) =>
            cookie.parse(value).pipe(
              Effect.flatMap((token) => users.identify(token)),
              Effect.map((session) => SessionState.Provided({ session })),
              Effect.orElseSucceed(() => SessionState.InvalidToken())
            )
          ),
          Effect.orElseSucceed(() => SessionState.NotProvided())
        )
      }),
      commitSession: (session: SessionState) =>
        Effect.gen(function* () {
          const response = yield* HttpResponse

          return yield* SessionState.$match(session, {
            Set: (s) => response.setCookie(cookie, s.session.token),
            Unset: () => response.unsetCookie(cookie),
            NotProvided: () => Effect.void,
            Provided: () => Effect.void,
            InvalidToken: () => response.unsetCookie(cookie)
          })
        })
    }
  })
}) {
  static middleware: Middleware.Middleware<Sessions, RequestSession> = (handler) =>
    Effect.gen(function* () {
      const requestSession = yield* RequestSession

      const session = yield* requestSession.createSession
      const sessions = yield* Sessions.make(session)

      const result = yield* handler.pipe(Effect.provideService(Sessions, sessions))

      const newSession = yield* sessions.get

      yield* requestSession.commitSession(newSession)

      return result
    })
}
