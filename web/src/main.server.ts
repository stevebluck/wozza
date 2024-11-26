import { Handler, Middleware } from "@wozza/react-router-effect"
import { SessionCookie } from "./auth/Sessions"
import { runtime } from "./runtime"

const middleware = <A, R>(handler: Handler.Handler<A, R>) =>
  handler.pipe(Middleware.withLogger, SessionCookie.middleware)

export const Loader = {
  fromEffect: Handler.fromEffect({ runtime, middleware }),
  unwrapEffect: Handler.unwrapEffect({ runtime, middleware })
}
