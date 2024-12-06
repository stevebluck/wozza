import { Loader } from "~/main.server"
import { Effect } from "effect"
import { CurrentSession, Sessions } from "../Sessions"
import { Result } from "@wozza/react-router-effect"
import { Users } from "@wozza/core"

export const action = Loader.unwrapEffect(
  Effect.gen(function* () {
    const users = yield* Users

    return CurrentSession.pipe(
      Effect.flatMap((session) => users.logout(session.token)),
      Effect.zipRight(Sessions.invalidate),
      Effect.map(() => Result.Redirect("/")),
      Effect.merge,
      Sessions.authenticated
    )
  })
)
