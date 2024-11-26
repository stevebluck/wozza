import { Route } from "./+types/register"
import { type MetaFunction } from "react-router"
import { Loader } from "~/main.server"
import { RegisterPage } from "~/auth/components/register-page"
import { AuthActions } from "~/auth/AuthActions"

export const meta: MetaFunction = () => {
  return [{ title: "Login" }]
}

export const action = Loader.fromEffect(AuthActions.register)

export default function Login(_props: Route.ComponentProps) {
  return <RegisterPage />
}
