import { AccountPage } from "~/users/components/account-page"
import * as Route from "./+types.dashboard"
import { type MetaFunction } from "react-router"

export const meta: MetaFunction = () => {
  return [{ title: "Account" }]
}

export default function Account(props: Route.ComponentProps) {
  return <AccountPage />
}
