import { Handler, Result } from "@wozza/react-router-effect"
import { Effect, Schema } from "effect"
import { CurrentSession } from "~/auth/Sessions"
import { User, UserFromCore, Users } from "~/users/Users"

export interface UserActions {
  getUser: Handler.Handler<{ user: User }, Users | CurrentSession>
}

export const UserActions: UserActions = {
  getUser: CurrentSession.pipe(
    Effect.map((session) => session.user.value),
    Effect.flatMap(Schema.decode(UserFromCore)),
    Effect.map((user) => Result.Json({ user })),
    Effect.orDie
  )
}
