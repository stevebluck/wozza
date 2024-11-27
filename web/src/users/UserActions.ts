import { User } from "@wozza/core"
import { Handler, Result } from "@wozza/react-router-effect"
import { Effect, Schema } from "effect"
import { CurrentSession } from "~/auth/Sessions"
import { Theme, Themes } from "~/themes/Themes"

export interface UserActions {
  getLayoutData: Handler.Handler<{ user: User.Encoded; theme: Theme }, CurrentSession | Themes>
}

export const UserActions: UserActions = {
  getLayoutData: Effect.gen(function* () {
    const session = yield* CurrentSession
    const themes = yield* Themes
    const theme = yield* themes.get

    return Result.Json({
      user: Schema.encodeSync(User)(session.user.value),
      theme
    })
  })
}
