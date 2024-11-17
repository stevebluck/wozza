import type { RouteConfig } from "@react-router/dev/routes"
import { index, layout, route } from "@react-router/dev/routes"

export const routes: RouteConfig = [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  layout("routes/dashboard-layout.tsx", [route("dashboard", "routes/dashboard.tsx")])
]
