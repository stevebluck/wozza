import { Outlet } from "react-router"
import { Loader } from "~/main.server"
import { AppLayout } from "~/admin/components/app-layout"
import { UserActions } from "~/users/UserActions"
import { withCurrentSession } from "~/auth/Sessions"
import { Route } from "./+types/layout"

export const loader = UserActions.getUser.pipe(withCurrentSession, Loader.fromEffect)

export default function Layout({ loaderData }: Route.ComponentProps) {
  return (
    <AppLayout user={loaderData.user}>
      <Outlet />
    </AppLayout>
  )
}
