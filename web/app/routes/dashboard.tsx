import * as Route from "./+types.dashboard"
import { type MetaFunction } from "react-router"
import { Effect } from "effect"
import { Result } from "@wozza/react-router-effect"
import { Loader } from "~/main.server"
import { Sessions } from "~/services/Sessions"

export const meta: MetaFunction = () => {
  return [{ title: "Login" }]
}

export const loader = Loader.fromEffect(
  Sessions.get.pipe(
    Effect.filterOrFail((a) => a._tag === "Provided"),
    Effect.map(() => Result.Json(null)),
    Effect.orElseSucceed(() => Result.Redirect("/login"))
  )
)

export default function Dashboard(props: Route.ComponentProps) {
  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  )
}
