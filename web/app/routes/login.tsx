import * as Route from "./+types.login"
import { type MetaFunction } from "react-router"
import { Effect, Option, Schema } from "effect"
import { Result } from "@wozza/react-router-effect"
import { Loader } from "~/main.server"
import { Sessions } from "~/auth/Sessions"
import { Email, Credentials } from "@wozza/core"
import { Users } from "~/users/Users"
import { HttpServerRequest } from "@effect/platform"
import { LoginPage } from "~/auth/components/login-page"

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
    Effect.flatMap((body) => Users.authenticate(credentialFromEmail(body.email))),
    Effect.flatMap(Sessions.mint),
    Effect.map(() => Result.Redirect("/")),
    Effect.orElseSucceed(() => Result.Json({ error: "Invalid email" }))
  )
)

export default function Login(_props: Route.ComponentProps) {
  return <LoginPage />
}
