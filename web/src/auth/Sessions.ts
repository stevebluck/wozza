import { Cookie, HttpResponse, Middleware, RequestSession, Result } from "@wozza/react-router-effect"
import { Array, Config, Context, Effect } from "effect"
import { Session, Token, User } from "@wozza/core"
import { Id } from "@wozza/prelude"
import { Users } from "~/users/Users"
import { HttpServerRequest } from "@effect/platform"

export class Sessions extends Effect.Tag("@app/Sessions")<Sessions, RequestSession.RequestSession<Session>>() {}

class SessionCookie extends Effect.Service<SessionCookie>()("@app/SessionCookie", {
  effect: Effect.gen(function* () {
    return Cookie.make({
      name: "_session",
      maxAge: "30 days",
      path: "/",
      schema: Token.schema<Id<User>>(),
      httpOnly: true,
      secrets: yield* Config.withDefault(Config.array(Config.redacted("SESSION_SECRETS")), Array.empty()),
      secure: yield* Config.string("NODE_ENV").pipe(Config.map((env) => env === "production"))
    })
  })
}) {}

export class SessionsBuilder extends Effect.Service<SessionsBuilder>()("@app/SessionsBuilder", {
  dependencies: [SessionCookie.Default],
  effect: Effect.gen(function* () {
    const users = yield* Users
    const cookie = yield* SessionCookie

    return {
      fromCookie: Effect.gen(function* () {
        const request = yield* HttpServerRequest.HttpServerRequest

        return yield* Effect.fromNullable(request.cookies[cookie.settings.name]).pipe(
          Effect.flatMap((value) =>
            cookie.parse(value).pipe(
              Effect.flatMap(users.identify),
              Effect.map((value) => RequestSession.State.Provided({ value })),
              Effect.orElseSucceed(() => RequestSession.State.InvalidToken())
            )
          ),
          Effect.orElseSucceed(() => RequestSession.State.NotProvided()),
          Effect.flatMap(RequestSession.make)
        )
      }),

      toCookie: Effect.gen(function* () {
        const sessions = yield* Sessions
        const response = yield* HttpResponse
        const session = yield* sessions.get

        return yield* RequestSession.State.$match(session, {
          Set: (s) => response.setCookie(cookie, s.value.token),
          Unset: () => response.unsetCookie(cookie),
          NotProvided: () => Effect.void,
          Provided: () => Effect.void,
          InvalidToken: () => response.unsetCookie(cookie)
        })
      })
    }
  })
}) {
  static middleware: Middleware.Middleware<Sessions, SessionsBuilder> = (handler) =>
    Effect.gen(function* () {
      const sessionsBuilder = yield* SessionsBuilder
      const sessions = yield* sessionsBuilder.fromCookie

      return yield* handler.pipe(
        Effect.onExit(() => sessionsBuilder.toCookie),
        Effect.provideService(Sessions, sessions)
      )
    })
}

export class CurrentSession extends Context.Tag("@app/CurrentSession")<CurrentSession, Session>() {
  static middleware: Middleware.Middleware<CurrentSession, Sessions> = (handler) =>
    Sessions.pipe(
      Effect.flatMap((sessions) => sessions.sessionData),
      Effect.mapError(() => Result.Redirect("/login")),
      Effect.flatMap((session) => handler.pipe(Effect.provideService(CurrentSession, session))),
      Effect.merge
    )
}
