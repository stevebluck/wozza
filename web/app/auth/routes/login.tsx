import { Route } from "./+types/login"
import { type MetaFunction } from "react-router"
import { Loader } from "~/main.server"
import { LoginPage } from "~/auth/components/login-page"
import { AuthActions } from "~/auth/AuthActions"

export const meta: MetaFunction = () => {
  return [{ title: "Login" }]
}

export const action = AuthActions.login.pipe(Loader.fromEffect)

export default function Login(_props: Route.ComponentProps) {
  return <LoginPage />
}
