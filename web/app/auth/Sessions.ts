import { Cookie, Handler, RequestSession, Result } from "@wozza/react-router-effect"
import { Array, Config, Context, Effect, Layer, ParseResult, Schema } from "effect"
import { Session, Token, User } from "@wozza/core"
import { Id } from "@wozza/prelude"
import { Users } from "~/users/Users"

export class CurrentSession extends Context.Tag("@app/CurrentSession")<CurrentSession, Session>() {}

export class Sessions extends Effect.Tag("@app/Sessions")<Sessions, RequestSession.RequestSession<Session>>() {}

export class SessionCookie extends Context.Tag("@app/SessionCookie")<SessionCookie, Cookie.Cookie<Session, Users>>() {
  static make = Effect.gen(function* () {
    const users = yield* Users

    const config = yield* Config.all({
      secrets: Config.withDefault(Config.array(Config.redacted()), Array.empty()),
      secure: Config.string("NODE_ENV").pipe(Config.map((env) => env === "production"))
    })

    const UserToken = Token.schema<Id<User>>()

    const SessionFromToken = Schema.transformOrFail(UserToken, Session, {
      decode: (token, _, ast) =>
        users.identify(token).pipe(
          Effect.map((session) => ({
            token: session.token.value,
            user: { id: session.user.id.value, value: session.user.value }
          })),
          Effect.catchAll((e) => ParseResult.fail(new ParseResult.Type(ast, token, e._tag)))
        ),
      encode: (session) => ParseResult.succeed(Token.make<Id<User>>(session.token))
    })

    return yield* Cookie.make({
      name: "_session",
      path: "/",
      maxAge: "365 days",
      httpOnly: true,
      schema: SessionFromToken,
      secrets: config.secrets,
      secure: config.secure
    })
  })

  static layer = Layer.effect(SessionCookie, this.make)

  static middleware = RequestSession.makeMiddleware(Sessions, SessionCookie)
}

export const withCurrentSession = <A, R>(handler: Handler.Handler<A, R>) =>
  Sessions.get.pipe(
    Effect.flatMap(
      RequestSession.State.$match({
        Provided: ({ value }) => Effect.succeed(value),
        Set: ({ value }) => Effect.succeed(value),
        Unset: () => Effect.fail(Result.Redirect("/login")),
        NotProvided: () => Effect.fail(Result.Redirect("/login")),
        InvalidToken: () => Effect.fail(Result.Redirect("/login"))
      })
    ),
    Effect.flatMap((session) => handler.pipe(Effect.provideService(CurrentSession, session))),
    Effect.merge
  )
