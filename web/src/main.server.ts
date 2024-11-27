import * as Sessions from "./auth/Sessions"
import { Handler, Middleware } from "@wozza/react-router-effect"
import { runtime } from "./runtime"
import * as Themes from "./themes/Themes"

const middleware = Middleware.middlewares(Middleware.withLogger, Sessions.withSessions, Themes.withThemes)

export const Loader = {
  fromEffect: Handler.fromEffect({ runtime, middleware }),
  unwrapEffect: Handler.unwrapEffect({ runtime, middleware })
}
