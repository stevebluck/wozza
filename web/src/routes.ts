import type { RouteConfig } from "@react-router/dev/routes"
import { index, layout, route } from "@react-router/dev/routes"

export default [
  route("login", "auth/routes/login.tsx"),
  route("register", "auth/routes/register.tsx"),
  route("logout", "auth/routes/logout.ts"),

  layout("users/routes/layout.tsx", [
    index("users/routes/dashboard.tsx"),
    route("account", "users/routes/account.tsx"),
    route("account/settings", "users/routes/account-settings.tsx")
  ])
] satisfies RouteConfig
