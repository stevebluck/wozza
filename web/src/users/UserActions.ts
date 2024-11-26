import { User } from "@wozza/core"
import { Handler, Result } from "@wozza/react-router-effect"
import { Effect, Schema } from "effect"
import { CurrentSession } from "~/auth/Sessions"
import { Users } from "~/users/Users"

export interface UserActions {
  getUser: Handler.Handler<{ user: User.Encoded }, Users | CurrentSession>
}

export const UserActions: UserActions = {
  getUser: CurrentSession.pipe(
    Effect.map((session) => session.user.value),
    Effect.flatMap(Schema.encode(User)),
    Effect.map((user) => Result.Json({ user })),
    Effect.orDie
  )
}
