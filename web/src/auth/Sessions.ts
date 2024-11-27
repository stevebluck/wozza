import { Cookie, Handler, RequestSession, Result } from "@wozza/react-router-effect"
import { Array, Config, Context, Effect, Layer } from "effect"
import { Session, Token, User } from "@wozza/core"
import { Id } from "@wozza/prelude"
import { Users } from "~/users/Users"

export class CurrentSession extends Context.Tag("@app/CurrentSession")<CurrentSession, Session>() {}

export class Sessions extends Effect.Tag("@app/Sessions")<Sessions, RequestSession.RequestSession<Session>>() {}

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

export const withSessions = RequestSession.makeMiddleware(
  SessionCookie,
  Sessions,
  (token) => Users.identify(token),
  (session) => session.token
)

export const withCurrentSession = <A, R>(handler: Handler.Handler<A, R>) =>
  Sessions.pipe(
    Effect.flatMap((sessions) => sessions.sessionData),
    Effect.mapError(() => Result.Redirect("/login")),
    Effect.flatMap((session) => handler.pipe(Effect.provideService(CurrentSession, session))),
    Effect.merge
  )
