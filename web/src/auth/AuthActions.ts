import { HttpServerRequest } from "@effect/platform"
import { Credentials, Email } from "@wozza/core"
import { Handler, Result } from "@wozza/react-router-effect"
import { Effect, Option, Schema } from "effect"
import { Users } from "~/users/Users"
import { CurrentSession, Sessions } from "./Sessions"

export interface AuthActions {
  register: Handler.Handler<{ error: string }, Users | Sessions>
  login: Handler.Handler<{ error: string }, Users | Sessions>
  logout: Handler.Handler<unknown, Users | CurrentSession | Sessions>

  // requestPasswordReset
  // resetPassword
}

export const AuthActions: AuthActions = {
  register: HttpServerRequest.schemaBodyUrlParams(Schema.Struct({ email: Email })).pipe(
    Effect.flatMap((body) => Users.register(credentialFromEmail(body.email))),
    Effect.flatMap(Sessions.mint),
    Effect.map(() => Result.Redirect("/")),
    Effect.mapError((e) => Result.Json({ error: e._tag })),
    Effect.merge
  ),

  login: HttpServerRequest.schemaBodyUrlParams(Schema.Struct({ email: Email })).pipe(
    Effect.flatMap((body) => Users.authenticate(credentialFromEmail(body.email))),
    Effect.flatMap(Sessions.mint),
    Effect.map(() => Result.Redirect("/")),
    Effect.orElseSucceed(() => Result.Json({ error: "Invalid email" }))
  ),

  logout: CurrentSession.pipe(
    Effect.flatMap((session) => Users.logout(session.token)),
    Effect.zipRight(Sessions.invalidate),
    Effect.map(() => Result.Redirect("/")),
    Effect.merge
  )
}

const credentialFromEmail = (email: Email) =>
  Credentials.OAuth({
    provider: "google",
    email,
    firstName: Option.none(),
    lastName: Option.none(),
    picture: Option.none()
  })
