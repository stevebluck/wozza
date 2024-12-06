import type { RouteConfig } from "@react-router/dev/routes"
import { index, layout, route } from "@react-router/dev/routes"

export default [
  layout("auth/routes/layout.tsx", [
    route("login", "auth/routes/login.tsx"),
    route("register", "auth/routes/register.tsx"),
    route("logout", "auth/routes/logout.ts")
  ]),

  layout("admin/routes/layout.tsx", [
    index("admin/routes/dashboard.tsx"),
    route("account", "users/routes/account.tsx"),
    route("account/settings", "users/routes/account-settings.tsx")
  ]),

  route("set-theme", "themes/routes/set-theme.ts")
] satisfies RouteConfig
