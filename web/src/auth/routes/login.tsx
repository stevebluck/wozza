import { Route } from "./+types/login"
import { type MetaFunction } from "react-router"
import { Loader } from "~/main.server"
import { LoginPage } from "~/auth/components/login-page"
import { HttpServerRequest } from "@effect/platform"
import { Effect, Schema } from "effect"
import { Sessions } from "../Sessions"
import { Result } from "@wozza/react-router-effect"
import { Email } from "@wozza/core"
import { credentialFromEmail, Users } from "~/users/Users"

export const meta: MetaFunction = () => {
  return [{ title: "Login" }]
}

export const action = Loader.unwrapEffect(
  Effect.gen(function* () {
    const users = yield* Users

    return HttpServerRequest.schemaBodyUrlParams(Schema.Struct({ email: Email })).pipe(
      Effect.flatMap((body) => users.authenticate(credentialFromEmail(body.email))),
      Effect.flatMap(Sessions.mint),
      Effect.map(() => Result.Redirect("/")),
      Effect.orElseSucceed(() => Result.Json({ error: "Invalid email" })),
      Sessions.guest
    )
  })
)

export default function Login(_props: Route.ComponentProps) {
  return <LoginPage />
}
