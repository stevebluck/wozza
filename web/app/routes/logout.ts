import { Effect } from "effect"
import { Result } from "@wozza/react-router-effect"
import { Loader } from "~/main.server"
import { Sessions } from "~/auth/Sessions"
import { Users } from "~/users/Users"

export const action = Loader.fromEffect(
  Sessions.get.pipe(
    Effect.filterOrFail(
      (session) => session._tag === "Provided",
      () => Result.Redirect("/")
    ),
    Effect.flatMap((session) => Users.logout(session.value.token)),
    Effect.zipRight(Sessions.invalidate),
    Effect.map(() => Result.Redirect("/")),
    Effect.merge
  )
)
