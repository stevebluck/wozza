import { Cookie, Handler, RequestSession, Result } from "@wozza/react-router-effect"
import { Array, Config, Context, Effect } from "effect"
import { Session, Token, User } from "@wozza/core"
import { Id } from "@wozza/prelude"
import { Users } from "~/users/Users"

export class CurrentSession extends Context.Tag("@app/CurrentSession")<CurrentSession, Session>() {}

export class Sessions extends Effect.Tag("@app/Sessions")<Sessions, RequestSession.RequestSession<Session>>() {}

export class SessionCookie extends Effect.Service<SessionCookie>()("SessionCookie", {
  effect: Effect.gen(function* () {
    const config = yield* Config.all({
      secrets: Config.withDefault(Config.array(Config.redacted("SESSION_SECRETS")), Array.empty()),
      secure: Config.string("NODE_ENV").pipe(Config.map((env) => env === "production"))
    })

    const UserIdToken = Token.schema<Id<User>>()

    return yield* Cookie.make({
      name: "_session",
      maxAge: "30 days",
      path: "/",
      schema: UserIdToken,
      httpOnly: true,
      secrets: config.secrets,
      secure: config.secure
    })
  })
}) {
  static middleware = RequestSession.makeMiddleware(
    SessionCookie, // makeCookieEffect
    Sessions, // provides
    (token) => Users.identify(token), // toSession
    (session) => session.token // fromSession
  )
}

export const withCurrentSession = <A, R>(handler: Handler.Handler<A, R>) =>
  Sessions.getSessionData.pipe(
    Effect.mapError(() => Result.Redirect("/login")),
    Effect.flatMap((session) => handler.pipe(Effect.provideService(CurrentSession, session))),
    Effect.merge
  )
