import { Effect, Ref } from "effect"
import { ParseError } from "effect/ParseResult"
import { Cookie } from "./Cookie"
import { HttpResponseState } from "./HttpResponseState"

export const setStatus = (status: number): Effect.Effect<void, never, HttpResponseState> => {
  return HttpResponseState.pipe(Effect.flatMap((state) => Ref.update(state, (s) => s.setStatus(status))))
}

export const setCookie = <A>(cookie: Cookie<A>, value: A): Effect.Effect<void, ParseError, HttpResponseState> =>
  Effect.gen(function* () {
    const state = yield* HttpResponseState
    yield* cookie.serialize(value).pipe(Effect.tap((cookie) => Ref.update(state, (state) => state.setCookie(cookie))))
  })

export const setHeader = (name: string, value: string): Effect.Effect<void, never, HttpResponseState> => {
  return HttpResponseState.pipe(Effect.flatMap((state) => Ref.update(state, (s) => s.setHeader(name, value))))
}
