import { Context, Effect } from "effect"
import { RequestSessions } from "./RequestSessions"
import { Handler } from "../handler/Handler"
import { SessionStorage } from "./SessionStorage"

export const make =
  <Id, T>(tag: Context.Tag<Id, RequestSessions<T>>) =>
  <A, E, R>(handler: Handler<A, E, R>) =>
    Effect.gen(function* () {
      const storage = yield* SessionStorage
      const sessionState = yield* storage.createSessionsState

      const sessions = yield* RequestSessions.make(sessionState)

      const result = yield* handler.pipe(
        Effect.onExit(() => sessions.get.pipe(Effect.flatMap(storage.save))),
        Effect.provideService(tag, sessions)
      )

      return result
    })
