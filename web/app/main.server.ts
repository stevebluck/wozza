import { Handler, Middleware } from "@wozza/react-router-effect"
import { runtime } from "./Runtime"
import * as CookieSessions from "./sessions/CookieSessions"
import { Context, Effect, Ref, Schema } from "effect"
import { SessionSchema } from "./sessions/Sessions"
import { RequestSession } from "./sessions/RequestSession"

const middleware = <A, E, R>(handler: Handler.Handler<A, E, R>) =>
  handler.pipe(Middleware.withLogger, CookieSessions.middleware(Schema.parseJson(SessionSchema)))

export const Loader = {
  fromEffect: Handler.fromEffect({ runtime, middleware }),
  unwrapEffect: Handler.unwrapEffect({ runtime, middleware })
}

interface SessionData {
  name: string
}

class Sessions<T> {
  static make = <T>(data: T): Effect.Effect<Sessions<T>> => {
    return Effect.gen(function* () {
      const ref = yield* Ref.make<T>(data)
      return new Sessions(ref)
    })
  }

  constructor(private readonly data: Ref.Ref<T>) {}
}

interface Handler<T> {
  (sessions: Sessions<T>): string
}

const sessionFromCookie = <T>(handler: Handler<T>): Effect.Effect<string> =>
  Effect.gen(function* () {
    const dataFromCookie = {} as T
    const sessions = yield* Sessions.make(dataFromCookie)

    return handler(sessions)
  })

const sessionFromDatabase = <T>(handler: Handler<T>): Effect.Effect<string> =>
  Effect.gen(function* () {
    const dataFromDatabase = {} as T
    const sessions = yield* Sessions.make(dataFromDatabase)

    return handler(sessions)
  })

export class AppSessions extends Context.Tag("AppSessions")<AppSessions, Sessions<SessionData>>() {}

// const program2 = Effect.gen(function* () {
//   const sessions = yield* sessionFromCookie<SessionData>(() => "")

//   handlerEffect.pipe(Effect.provideService(AppSessions, sessions))
// })

// const handlerEffect = Effect.gen(function* () {
//   const sessions = yield* AppSessions
// })
