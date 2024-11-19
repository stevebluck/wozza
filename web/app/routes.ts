import type { RouteConfig } from "@react-router/dev/routes"
import { index, layout, route } from "@react-router/dev/routes"

export const routes: RouteConfig = [
  layout("routes/layout.tsx", [index("routes/dashboard.tsx"), route("account", "routes/account.tsx")]),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("logout", "routes/logout.ts")
]
