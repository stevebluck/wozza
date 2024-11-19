import * as Route from "./+types.dashboard"
import { type MetaFunction } from "react-router"

export const meta: MetaFunction = () => {
  return [{ title: "Login" }]
}

export default function Account(props: Route.ComponentProps) {
  return (
    <div>
      <h1>Account</h1>
    </div>
  )
}
