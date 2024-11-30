import { Effect } from "effect"
import { Outlet } from "react-router"
import { Result } from "@wozza/react-router-effect"
import { Loader } from "~/main.server"
import { cn } from "~/ui/classnames"
import { useTheme } from "~/themes/components/theme-selector"
import { Themes } from "~/themes/Themes"
import { Sessions } from "../Sessions"
import { Route } from "./+types/auth-layout"

export const loader = Effect.gen(function* () {
  const themes = yield* Themes

  const theme = yield* themes.get
  return Result.Json({ theme })
}).pipe(Sessions.guest, Loader.fromEffect)

export default function AuthLayout({ loaderData }: Route.ComponentProps) {
  const { theme } = useTheme(loaderData.theme)
  return (
    <div className={cn(theme, "bg-background")}>
      <Outlet />
    </div>
  )
}
