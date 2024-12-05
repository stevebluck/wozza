import type { RouteConfig } from "@react-router/dev/routes"
import { index, layout, route } from "@react-router/dev/routes"

export default [
  layout("auth/routes/auth-layout-route.tsx", [
    route("login", "auth/routes/login-route.tsx"),
    route("register", "auth/routes/register-route.tsx"),
    route("logout", "auth/routes/logout-route.ts")
  ]),

  layout("admin/routes/admin-layout-route.tsx", [
    index("admin/routes/dashboard-route.tsx"),
    route("account", "users/routes/account-route.tsx"),
    route("account/settings", "users/routes/account-settings-route.tsx")
  ]),

  route("set-theme", "themes/routes/set-theme-route.ts")
] satisfies RouteConfig
