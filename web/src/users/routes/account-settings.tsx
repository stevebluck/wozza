import { type MetaFunction } from "react-router"
import { Route } from "./+types/account-settings"

export const meta: MetaFunction = () => {
  return [{ title: "Account" }]
}

export default function AccountSettings(props: Route.ComponentProps) {
  return (
    <div>
      <h1>Account Settings</h1>
      <div>stuff</div>
    </div>
  )
}
