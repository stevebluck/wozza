import { Effect } from "effect"
import { Outlet } from "react-router"
import { Result } from "@wozza/react-router-effect"
import { Loader } from "~/main.server"
import { Sessions } from "../Sessions"

export const loader = Effect.succeed(Result.Json(null)).pipe(Sessions.guest, Loader.fromEffect)

export default function AuthLayout() {
  return (
    <div className="flex h-screen w-full items-center justify-center px-4 bg-background">
      <Outlet />
    </div>
  )
}
