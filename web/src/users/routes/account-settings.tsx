import { type MetaFunction } from "react-router"
import { Route } from "./+types/account-settings"
import { AccountSettingsPage } from "../components/account-settings-page"

export const meta: MetaFunction = () => {
  return [{ title: "Account" }]
}

export default function AccountSettings(props: Route.ComponentProps) {
  return <AccountSettingsPage />
}
