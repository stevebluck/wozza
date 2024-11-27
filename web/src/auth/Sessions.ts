import { Cookie, Handler, RequestSession, Result } from "@wozza/react-router-effect"
import { Array, Config, Context, Effect } from "effect"
import { Session, Token, User } from "@wozza/core"
import { Id } from "@wozza/prelude"
import { Users } from "~/users/Users"

export class CurrentSession extends Context.Tag("@app/CurrentSession")<CurrentSession, Session>() {}

export class Sessions extends Effect.Tag("@app/Sessions")<Sessions, RequestSession.RequestSession<Session>>() {}

export class SessionCookie extends Effect.Service<SessionCookie>()("@app/SessionCookie", {
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

export const withSessions = RequestSession.makeMiddleware(
  SessionCookie,
  Sessions,
  (token) => Users.identify(token),
  (session) => session.token
)

export const withCurrentSession = <A, R>(handler: Handler.Handler<A, R>) =>
  Sessions.sessionData.pipe(
    Effect.mapError(() => Result.Redirect("/login")),
    Effect.flatMap((session) => handler.pipe(Effect.provideService(CurrentSession, session))),
    Effect.merge
  )
