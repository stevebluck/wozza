import { DashboardPage } from "../components/dashboard-page"
import { type MetaFunction } from "react-router"
import { Route } from "./+types/dashboard"
import { Loader } from "~/main.server"
import { Themes } from "~/themes/Themes"
import { Effect } from "effect"
import { Result } from "@wozza/react-router-effect"

export const meta: MetaFunction = () => {
  return [{ title: "Dashboard" }]
}

export const loader = Loader.fromEffect(
  Effect.gen(function* () {
    const themes = yield* Themes

    const theme = yield* themes.get
    return Result.Json({ theme })
  })
)

export default function Dashboard(props: Route.ComponentProps) {
  return <DashboardPage theme={props.loaderData.theme} />
}
