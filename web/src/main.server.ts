import * as Sessions from "./auth/Sessions"
import { Handler, Middleware } from "@wozza/react-router-effect"
import { runtime } from "./runtime"
import * as Themes from "./themes/Themes"

const middleware = <A, R>(handler: Handler.Handler<A, R>) =>
  handler.pipe(Middleware.withLogger, Themes.withThemes, Sessions.withSessions) /*as Handler.Handler<
A,
Exclude<R, Themes.Themes | Sessions.Sessions>
>*/

export const Loader = {
  fromEffect: Handler.fromEffect({ runtime, middleware }),
  unwrapEffect: Handler.unwrapEffect({ runtime, middleware })
}
