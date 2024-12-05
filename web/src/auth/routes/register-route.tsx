import { type MetaFunction } from "react-router"
import { HttpServerRequest } from "@effect/platform"
import { Effect, Schema } from "effect"
import { Email } from "@wozza/core"
import { Sessions } from "../Sessions"
import { Result } from "@wozza/react-router-effect"
import { credentialFromEmail, Users } from "~/users/Users"
import { Route } from "./+types/register-route"
import { Loader } from "~/main.server"
import { RegisterCard } from "../components/register-card"

export const meta: MetaFunction = () => {
  return [{ title: "Login" }]
}

export const action = Loader.unwrapEffect(
  Effect.gen(function* () {
    const users = yield* Users

    return HttpServerRequest.schemaBodyUrlParams(Schema.Struct({ email: Email })).pipe(
      Effect.flatMap((body) => users.register(credentialFromEmail(body.email))),
      Effect.flatMap((session) => Sessions.mint(session)),
      Effect.map(() => Result.Redirect("/")),
      Effect.mapError((e) => Result.Json({ error: e._tag })),
      Effect.merge,
      Sessions.guest
    )
  })
)

export default function Login(_props: Route.ComponentProps) {
  return <RegisterCard />
}
