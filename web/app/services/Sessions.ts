import { Cookie, RequestSession } from "@wozza/react-router-effect"
import { Array, Config, Context, Effect, Layer, ParseResult, Schema } from "effect"
import { Users } from "./Users"
import { Session, Token, User } from "@wozza/core"
import { Id } from "@wozza/prelude"

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
