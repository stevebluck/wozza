import { AccountPage } from "~/users/components/account-page"
import { type MetaFunction } from "react-router"
import { Route } from "./+types/account"

export const meta: MetaFunction = () => {
  return [{ title: "Account" }]
}

export default function Account(props: Route.ComponentProps) {
  return <AccountPage />
}
