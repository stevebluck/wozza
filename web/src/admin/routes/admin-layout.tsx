import { Outlet } from "react-router"
import { Loader } from "~/main.server"
import { AppLayout } from "~/admin/components/app-layout"
import { Effect, Schema } from "effect"
import { User } from "@wozza/core"
import { Result } from "@wozza/react-router-effect"
import { CurrentSession, Sessions } from "~/auth/Sessions"
import { Themes } from "~/themes/Themes"
import { Route } from "./+types/admin-layout"
import { cn } from "~/ui/classnames"

export const loader = Effect.gen(function* () {
  const session = yield* CurrentSession
  const themes = yield* Themes

  const theme = yield* themes.get

  return Result.Json({
    user: Schema.encodeSync(User)(session.user.value),
    theme
  })
}).pipe(Sessions.authenticated, Loader.fromEffect)

export default function AdminLayout({ loaderData }: Route.ComponentProps) {
  return (
    <AppLayout user={loaderData.user} theme={loaderData.theme}>
      <Outlet />
    </AppLayout>
  )
}
