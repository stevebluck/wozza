import { Loader } from "~/main.server"
import { AuthActions } from "~/auth/AuthActions"
import { CurrentSession } from "../Sessions"

export const action = AuthActions.logout.pipe(CurrentSession.middleware, Loader.fromEffect)
