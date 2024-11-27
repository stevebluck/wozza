import { Cause, Context, Data, Effect, Option, Ref, Schema } from "effect"
import { Cookie } from "./Cookie"
import { Handler } from "./Handler"
import { HttpResponse } from "./HttpResponse"
import { HttpServerRequest } from "@effect/platform"

export interface RequestSession<T> {
  get: Effect.Effect<State<T>, never>
  mint: (value: T) => Effect.Effect<void, never>
  set: (state: State<T>) => Effect.Effect<void, never>
  invalidate: Effect.Effect<void, never>
  sessionData: Effect.Effect<T, Cause.NoSuchElementException>
}

export const make = <T>(state: State<T>): Effect.Effect<RequestSession<T>, never> =>
  Effect.gen(function* () {
    const session = yield* Ref.make<State<T>>(state)
    return {
      get: session.get,
      mint: (value: T) => Ref.set(session, State.Set({ value })),
      set: (state: State<T>) => Ref.set(session, state),
      invalidate: Ref.set(session, State.Unset()),
      sessionData: session.get.pipe(
        Effect.flatMap(
          State.$match({
            Provided: ({ value }) => Option.some(value),
            Set: ({ value }) => Option.some(value),
            Unset: () => Option.none(),
            NotProvided: () => Option.none(),
            InvalidToken: () => Option.none()
          })
        )
      )
    }
  })

export const makeMiddleware =
  <Id, C, SessionData, E, R, CR, MCE, MCR>(
    getCookie: Effect.Effect<Cookie<C, CR>, MCE, MCR>,
    service: Context.Tag<Id, RequestSession<SessionData>>,
    fromCookie: (cookieValue: C) => Effect.Effect<SessionData, E, R>,
    toCookie: (sessionData: SessionData) => C
  ) =>
  <A, R>(handler: Handler<A, R>) =>
    Effect.gen(function* () {
      const cookie = yield* getCookie
      const response = yield* HttpResponse

      const sessionState = yield* HttpServerRequest.schemaHeaders(Schema.Struct({ cookie: Schema.String })).pipe(
        Effect.flatMap((headers) =>
          cookie.parse(headers.cookie).pipe(
            Effect.flatMap(fromCookie),
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
                Set: (s) => response.setCookie(cookie, toCookie(s.value)),
                Unset: () => response.unsetCookie(cookie),
                NotProvided: () => Effect.void,
                Provided: () => Effect.void,
                InvalidToken: () => response.unsetCookie(cookie)
              })
            )
          )
        ),
        Effect.provideService(service, sessions)
      )

      return result
    })

type State<T> = Data.TaggedEnum<{
  Provided: { value: T }
  NotProvided: {}
  Set: { value: T }
  Unset: {}
  InvalidToken: {}
}>

interface StateDef extends Data.TaggedEnum.WithGenerics<1> {
  readonly taggedEnum: State<this["A"]>
}

const State = Data.taggedEnum<StateDef>()
