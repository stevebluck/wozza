import { Context, Data, Effect, Ref, Schema } from "effect"
import { Cookie } from "./Cookie"
import { Handler } from "./Handler"
import { HttpResponse } from "./HttpResponse"
import { HttpServerRequest } from "@effect/platform"

export interface RequestSession<T> {
  get: Effect.Effect<State<T>, never>
  mint: (value: T) => Effect.Effect<void, never>
  set: (state: State<T>) => Effect.Effect<void, never>
  invalidate: Effect.Effect<void, never>
}

export const make = <T>(state: State<T>): Effect.Effect<RequestSession<T>, never> =>
  Effect.gen(function* () {
    const session = yield* Ref.make<State<T>>(state)
    return {
      get: session.get,
      mint: (value: T) => Ref.set(session, State.Set({ value })),
      set: (state: State<T>) => Ref.set(session, state),
      invalidate: Ref.set(session, State.Unset())
    }
  })

export const makeMiddleware =
  <Id, SessionData, CR, MCE, MCR>(
    tag: Context.Tag<Id, RequestSession<SessionData>>,
    getCookie: Effect.Effect<Cookie<SessionData, CR>, MCE, MCR>
  ) =>
  <A, R>(handler: Handler<A, R>) =>
    Effect.gen(function* () {
      const cookie = yield* getCookie
      const response = yield* HttpResponse

      const sessionState = yield* HttpServerRequest.schemaHeaders(Schema.Struct({ cookie: Schema.String })).pipe(
        Effect.zipRight(
          cookie.parse.pipe(
            Effect.map((value) => State.Provided({ value })),
            Effect.orElseSucceed(() => State.InvalidToken())
          )
        ),
        Effect.orElseSucceed(() => State.NotProvided())
      )

      const sessions = yield* make(sessionState)

      const result = yield* handler.pipe(
        Effect.onExit(() =>
          sessions.get.pipe(
            Effect.flatMap(
              State.$match({
                Set: (s) => response.setCookie(cookie, s.value),
                Unset: () => response.unsetCookie(cookie),
                NotProvided: () => Effect.void,
                Provided: () => Effect.void,
                InvalidToken: () => response.unsetCookie(cookie)
              })
            )
          )
        ),
        Effect.provideService(tag, sessions)
      )

      return result
    })

export type State<T> = Data.TaggedEnum<{
  Provided: { value: T }
  NotProvided: {}
  Set: { value: T }
  Unset: {}
  InvalidToken: {}
}>

interface StateDef extends Data.TaggedEnum.WithGenerics<1> {
  readonly taggedEnum: State<this["A"]>
}

export const State = Data.taggedEnum<StateDef>()
