import { Handler, HttpMiddleware } from "@wozza/react-router-effect"
import { SessionCookie } from "./services/Sessions"
import { runtime } from "./runtime"

const middleware = <A, R>(handler: Handler.Handler<A, R>) =>
  handler.pipe(HttpMiddleware.withLogger, SessionCookie.middleware)

export const Loader = {
  fromEffect: Handler.fromEffect({ runtime, middleware }),
  unwrapEffect: Handler.unwrapEffect({ runtime, middleware })
}
