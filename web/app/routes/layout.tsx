import * as Route from "./+types.layout"
import { Outlet } from "react-router"
import { Effect, Schema } from "effect"
import { Loader } from "~/main.server"
import { AppLayout } from "~/ui/components/app-layout"
import { CurrentSession, withCurrentSession } from "~/auth/Sessions"
import { Result } from "@wozza/react-router-effect"
import { UserFromCore } from "~/users/Users"

export const loader = Loader.fromEffect(
  CurrentSession.pipe(
    Effect.map((session) => session.user.value),
    Effect.flatMap(Schema.decode(UserFromCore)),
    Effect.map((user) => Result.Json({ user })),
    Effect.orDie,
    withCurrentSession
  )
)

export default function Layout({ loaderData }: Route.ComponentProps) {
  return (
    <AppLayout user={loaderData.user}>
      <Outlet />
    </AppLayout>
  )
}
