import { Handler, Middleware } from "@wozza/react-router-effect"
import { runtime } from "./runtime"
import { RequestSession } from "./auth/RequestSession"

const middleware = Middleware.middlewares(Middleware.withLogger, RequestSession.middleware)

export const Loader = {
  fromEffect: Handler.fromEffect({ runtime, middleware }),
  unwrapEffect: Handler.unwrapEffect({ runtime, middleware })
}
