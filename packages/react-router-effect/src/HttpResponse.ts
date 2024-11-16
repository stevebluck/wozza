import { Effect, Ref } from "effect"
import { Cookie } from "./Cookie"
import { HttpResponseState } from "./HttpResponseState"

export const setStatus = (status: number): Effect.Effect<void, never, HttpResponseState> => {
  return HttpResponseState.pipe(Effect.flatMap((state) => Ref.update(state, (s) => s.setStatus(status))))
}

export const setCookie = <A, R>(cookie: Cookie<A, R>, value: A): Effect.Effect<void, never, HttpResponseState | R> =>
  Effect.gen(function* () {
    const state = yield* HttpResponseState
    yield* cookie.serialize(value).pipe(
      Effect.tap((serialised) => Ref.update(state, (state) => state.setCookie(serialised))),
      Effect.orDie
    )
  })

export const unsetCookie = <A, R>(cookie: Cookie<A, R>): Effect.Effect<void, never, HttpResponseState | R> =>
  Effect.gen(function* () {
    const state = yield* HttpResponseState
    yield* cookie.unset.pipe(Effect.tap((updated) => Ref.update(state, (state) => state.setCookie(updated))))
  })

export const setHeader = (name: string, value: string): Effect.Effect<void, never, HttpResponseState> => {
  return HttpResponseState.pipe(Effect.flatMap((state) => Ref.update(state, (s) => s.setHeader(name, value))))
}