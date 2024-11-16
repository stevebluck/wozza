import { Cookie, RequestSession } from "@wozza/react-router-effect"
import { Array, Config, Context, Effect, Layer, ParseResult, Schema } from "effect"
import { Users } from "./Users"
import { Token } from "@wozza/core"

export class Sessions extends Effect.Tag("@app/Sessions")<Sessions, RequestSession.RequestSession<Session>>() {}

export class SessionCookie extends Context.Tag("@app/SessionCookie")<SessionCookie, Cookie.Cookie<Session, Users>>() {
  static layer = Layer.unwrapEffect(
    Effect.gen(function* () {
      const users = yield* Users
      const config = yield* Config.all({
        secrets: Config.withDefault(Config.array(Config.redacted()), Array.empty()),
        secure: Config.string("NODE_ENV").pipe(Config.map((env) => env === "production"))
      })

      const SessionFromToken = Schema.transformOrFail(Token, Session, {
        decode: (token, _, ast) =>
          users.identify(token).pipe(
            Effect.map((user) => Session.make({ token, user })),
            Effect.catchAll(() => ParseResult.fail(new ParseResult.Type(ast, token, "Invalid token")))
          ),
        encode: (session) => ParseResult.succeed(Token.make(session.token))
      })

      return Layer.effect(
        SessionCookie,
        Cookie.make({
          name: "_session",
          path: "/",
          maxAge: "365 days",
          httpOnly: true,
          schema: SessionFromToken,
          secrets: config.secrets,
          secure: config.secure
        })
      )
    })
  )

  static middleware = RequestSession.makeMiddleware(Sessions, SessionCookie)
}

class Session extends Schema.Class<Session>("Session")({
  token: Token,
  user: Schema.Struct({ name: Schema.String })
}) {}
