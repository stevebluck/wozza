import { Effect, Option } from "effect"

export const refineErrorOrDie =
  <A, E, E1, R>(f: (e: E) => Option.Option<E1>) =>
  (self: Effect.Effect<A, E, R>): Effect.Effect<A, E1, R> =>
    self.pipe(
      Effect.catchAll((e) =>
        Option.match(f(e), {
          onNone: () => Effect.die(e),
          onSome: Effect.fail
        })
      )
    )
