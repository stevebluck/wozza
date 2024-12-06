import { type MetaFunction } from "react-router"
import { HttpServerRequest } from "@effect/platform"
import { Effect, Schema } from "effect"
import { Email } from "@wozza/domain"
import { Sessions } from "../Sessions"
import { Result } from "@wozza/react-router-effect"
import { credentialFromEmail } from "../credentialFromEmail"
import { Users } from "@wozza/core"
import { Route } from "./+types/register"
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
