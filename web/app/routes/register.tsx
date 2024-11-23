import * as Route from "./+types.login"
import { type MetaFunction } from "react-router"
import { Effect, Option, Schema } from "effect"
import { Result } from "@wozza/react-router-effect"
import { Loader } from "~/main.server"
import { Sessions } from "~/auth/Sessions"
import { Email, Credentials } from "@wozza/core"
import { Users } from "~/users/Users"
import { HttpServerRequest } from "@effect/platform"
import { RegisterPage } from "~/auth/components/register-page"

export const meta: MetaFunction = () => {
  return [{ title: "Login" }]
}

const credentialFromEmail = (email: Email) =>
  Credentials.OAuth({
    provider: "google",
    email,
    firstName: Option.none(),
    lastName: Option.none(),
    picture: Option.none()
  })

export const action = Loader.fromEffect(
  HttpServerRequest.schemaBodyForm(Schema.Struct({ email: Email })).pipe(
    Effect.flatMap((body) => Users.register(credentialFromEmail(body.email))),
    Effect.tapError(Effect.logError),
    Effect.tap(Effect.log),
    Effect.flatMap(Sessions.mint),
    Effect.map(() => Result.Redirect("/")),
    Effect.mapError((e) => Result.Json({ error: e._tag })),
    Effect.merge
  )
)

export default function Login(_props: Route.ComponentProps) {
  return <RegisterPage />
}
