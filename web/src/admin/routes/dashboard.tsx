import { DashboardPage } from "../components/dashboard-page"
import { type MetaFunction } from "react-router"
import { Route } from "./+types/dashboard"

export const meta: MetaFunction = () => {
  return [{ title: "Dashboard" }]
}

export default function Dashboard(props: Route.ComponentProps) {
  return <DashboardPage />
}
