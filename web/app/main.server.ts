import { Handler, Middleware, RequestSession, Result } from "@wozza/react-router-effect"
import { SessionCookie, Sessions } from "./services/Sessions"
import { runtime } from "./runtime"
import { Effect } from "effect"

const middleware = <A, R>(handler: Handler.Handler<A, R>) =>
  handler.pipe(Middleware.withLogger, SessionCookie.middleware)

// Provide CurrentSession
export const isAuthenticated =
  (redirect?: string) =>
  <A, R>(handler: Handler.Handler<A, R>) =>
    Sessions.get.pipe(
      Effect.flatMap(
        RequestSession.State.$match({
          Provided: ({ value }) => Effect.succeed(value),
          Set: ({ value }) => Effect.succeed(value),
          Unset: () => Effect.fail(Result.Redirect(redirect ?? "/login")),
          NotProvided: () => Effect.fail(Result.Redirect(redirect ?? "/login")),
          InvalidToken: () => Effect.fail(Result.Redirect(redirect ?? "/login"))
        })
      ),
      Effect.flatMap((session) => handler),
      Effect.merge
    )

export const Loader = {
  fromEffect: Handler.fromEffect({ runtime, middleware }),
  unwrapEffect: Handler.unwrapEffect({ runtime, middleware })
}
