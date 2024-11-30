import { Cookie, HttpResponse, Middleware } from "@wozza/react-router-effect"
import { Array, Config, Effect } from "effect"
import { Token, User } from "@wozza/core"
import { Id } from "@wozza/prelude"
import { Users } from "~/users/Users"
import { HttpServerRequest } from "@effect/platform"
import { SessionState, Sessions } from "./Sessions"

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
      makeSessions: Effect.gen(function* () {
        const request = yield* HttpServerRequest.HttpServerRequest

        return yield* Effect.fromNullable(request.cookies[cookie.settings.name]).pipe(
          Effect.flatMap((value) =>
            cookie.parse(value).pipe(
              Effect.flatMap((token) => users.identify(token)),
              Effect.map((session) => SessionState.Provided({ session })),
              Effect.orElseSucceed(() => SessionState.InvalidToken())
            )
          ),
          Effect.orElseSucceed(() => SessionState.NotProvided()),
          Effect.flatMap((state) => Sessions.make(state))
        )
      }),
      commit: (session: SessionState) =>
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

      const sessions = yield* requestSession.makeSessions

      const result = yield* handler.pipe(Effect.provideService(Sessions, sessions))

      const session = yield* sessions.get

      yield* requestSession.commit(session)

      return result
    })
}
