import { Context, Data, Effect, Ref } from "effect"
import { Cookie } from "./Cookie"
import { Handler } from "./Handler"
import * as HttpRequest from "./HttpRequest"
import * as HttpResponse from "./HttpResponse"

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
  <A, E, R>(handler: Handler<A, E, R>) =>
    Effect.gen(function* () {
      const cookie = yield* getCookie

      const sessionState = yield* HttpRequest.getCookieHeader.pipe(
        Effect.flatMap(() => HttpRequest.parseCookie(cookie)),
        Effect.map((session) => State.Provided({ value: session })),
        Effect.catchTags({
          CookieHeaderNotFound: () => Effect.succeed(State.NotProvided()),
          ParseError: () => Effect.succeed(State.InvalidToken()),
          CookieError: () => Effect.succeed(State.NotProvided())
        })
      )

      const sessions = yield* make(sessionState)

      const result = yield* handler.pipe(
        Effect.onExit(() =>
          sessions.get.pipe(
            Effect.flatMap(
              State.$match({
                Set: (s) => HttpResponse.setCookie(cookie, s.value),
                Unset: () => HttpResponse.unsetCookie(cookie),
                NotProvided: () => Effect.void,
                Provided: () => Effect.void,
                InvalidToken: () => HttpResponse.unsetCookie(cookie)
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

export class Unauthorized extends Data.TaggedError("Unauthorized") {}
