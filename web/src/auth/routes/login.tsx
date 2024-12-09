import { Route } from "./+types/login"
import { type MetaFunction } from "react-router"
import { Loader } from "~/main.server"
import { HttpServerRequest } from "@effect/platform"
import { Effect, Schema } from "effect"
import { Sessions } from "../Sessions"
import { Result } from "@wozza/react-router-effect"
import { LoginCard } from "../components/login-card"
import { Email, Password } from "@wozza/domain"
import { Users } from "@wozza/core"

export const meta: MetaFunction = () => {
  return [{ title: "Login" }]
}

export const action = Loader.unwrapEffect(
  Effect.gen(function* () {
    const users = yield* Users

    return HttpServerRequest.schemaBodyUrlParams(Schema.Struct({ email: Email, password: Password.Plaintext })).pipe(
      Effect.flatMap((body) => users.authenticate(body.email, body.password)),
      Effect.flatMap(Sessions.mint),
      Effect.map(() => Result.Redirect("/")),
      Effect.orElseSucceed(() => Result.Json({ error: "Invalid email" })),
      Sessions.guest
    )
  })
)

export default function Login(_props: Route.ComponentProps) {
  return <LoginCard />
}
