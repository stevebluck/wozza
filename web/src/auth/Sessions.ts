import { Cookie, Handler, HttpResponse, RequestSession, Result } from "@wozza/react-router-effect"
import { Array, Config, Context, Effect, Layer } from "effect"
import { Session, Token, User } from "@wozza/core"
import { Id } from "@wozza/prelude"
import { Users } from "~/users/Users"
import { HttpServerRequest } from "@effect/platform"
import { State } from "node_modules/@wozza/react-router-effect/src/RequestSession"
import { ThemeCookie, Themes } from "~/themes/Themes"

export class CurrentSession extends Context.Tag("@app/CurrentSession")<CurrentSession, Session>() {}

export class Sessions extends Context.Tag("@app/Sessions")<Sessions, RequestSession.RequestSession<Session>>() {}

export class SessionCookie extends Context.Tag("@app/SessionCookie")<SessionCookie, Cookie.Cookie<Token<Id<User>>>>() {
  static make = Effect.gen(function* () {
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

  static Default = Layer.effect(SessionCookie, this.make)
}

// export const withSessions = RequestSession.makeMiddleware(
//   SessionCookie,
//   Sessions,
//   (token) => Users.identify(token),
//   (session) => session.token
// )

export const withSessions = {
  provides: Sessions,
  handler: <A, R>(handler: Handler.Handler<A, R>): Handler.Handler<A, Exclude<R, Sessions>> =>
  Effect.gen(function* () {
    // const cookie = yield* SessionCookie
    // const response = yield* HttpResponse
    // const users = yield* Users
    // const request = yield* HttpServerRequest.HttpServerRequest

    // const sessionState = yield* Effect.fromNullable(request.cookies[cookie.settings.name]).pipe(
    //   Effect.flatMap((value) =>
    //     cookie.parse(value).pipe(
    //       Effect.flatMap(users.identify),
    //       Effect.map((value) => State.Provided({ value })),
    //       Effect.orElseSucceed(() => State.InvalidToken())
    //     )
    //   ),
    //   Effect.orElseSucceed(() => State.NotProvided())
    // )

    const sessions = yield* RequestSession.make<Session>(State.NotProvided())

    const result = handler.pipe(
      // Effect.onExit(() =>
      //   sessions.get.pipe(
      //     Effect.flatMap(
      //       State.$match({
      //         Set: (s) => response.setCookie(cookie, s.value.token),
      //         Unset: () => response.unsetCookie(cookie),
      //         NotProvided: () => Effect.void,
      //         Provided: () => Effect.void,
      //         InvalidToken: () => response.unsetCookie(cookie)
      //       })
      //     )
      //   )
      // ),
      Effect.provideService(Sessions, sessions)
    )

    return yield* result
  })
}

export const withCurrentSession = <A, R>(handler: Handler.Handler<A, R>) =>
  Sessions.pipe(
    Effect.flatMap((sessions) => sessions.sessionData),
    Effect.mapError(() => Result.Redirect("/login")),
    Effect.flatMap((session) => handler.pipe(Effect.provideService(CurrentSession, session))),
    Effect.merge
  )
