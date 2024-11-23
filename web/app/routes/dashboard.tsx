import { DashboardPage } from "~/users/components/dashboard-page"
import * as Route from "./+types.dashboard"
import { type MetaFunction } from "react-router"

export const meta: MetaFunction = () => {
  return [{ title: "Dashboard" }]
}

export default function Dashboard(props: Route.ComponentProps) {
  return <DashboardPage />
}
