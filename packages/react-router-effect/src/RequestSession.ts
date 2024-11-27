import { Cause, Data, Effect, Option, Ref } from "effect"

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
