import { Handler, Middleware } from "@wozza/react-router-effect"
import { runtime } from "./runtime"
import { SessionsBuilder } from "./auth/Sessions"

const middleware = Middleware.middlewares(Middleware.withLogger, SessionsBuilder.middleware)

export const Loader = {
  fromEffect: Handler.fromEffect({ runtime, middleware }),
  unwrapEffect: Handler.unwrapEffect({ runtime, middleware })
}
