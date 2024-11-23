import { Loader } from "~/main.server"
import { AuthActions } from "~/auth/AuthActions"
import { withCurrentSession } from "~/auth/Sessions"

export const action = AuthActions.logout.pipe(withCurrentSession, Loader.fromEffect)
