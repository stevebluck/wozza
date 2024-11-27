import { Outlet } from "react-router"
import { Loader } from "~/main.server"
import { AppLayout } from "~/admin/components/app-layout"
import { UserActions } from "~/users/UserActions"
import { CurrentSession } from "~/auth/Sessions"
import { Route } from "./+types/layout"

export const loader = UserActions.getLayoutData.pipe(CurrentSession.middleware, Loader.fromEffect)

export default function Layout({ loaderData }: Route.ComponentProps) {
  return (
    <AppLayout user={loaderData.user} theme={loaderData.theme}>
      <Outlet />
    </AppLayout>
  )
}
