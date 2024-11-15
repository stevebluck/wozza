import { Data, Effect, Ref } from "effect"

export class RequestSessions<T> {
  static make = <T>(state: State<T>): Effect.Effect<RequestSessions<T>> =>
    Effect.gen(function* () {
      const ref = yield* Ref.make<State<T>>(state)
      return new RequestSessions<T>(ref)
    })

  constructor(private readonly session: Ref.Ref<State<T>>) {}

  get get(): Effect.Effect<State<T>> {
    return this.session.get
  }

  mint = (value: T): Effect.Effect<void> => {
    return Ref.set(this.session, State.Set({ value }))
  }

  set = (session: State<T>): Effect.Effect<void> => {
    return Ref.set(this.session, session)
  }

  get invalidate(): Effect.Effect<void> {
    return Ref.set(this.session, State.Unset())
  }

  get authenticated(): Effect.Effect<T, Unauthorized> {
    return this.session.get.pipe(
      Effect.flatMap(
        State.$match({
          Provided: (s) => Effect.succeed(s.value),
          Set: (s) => Effect.succeed(s.value),
          InvalidToken: () => new Unauthorized(),
          NotProvided: () => new Unauthorized(),
          Unset: () => new Unauthorized()
        })
      )
    )
  }
}

export type State<T> = Data.TaggedEnum<{
  Provided: { value: T }
  NotProvided: {}
  Set: { value: T }
  Unset: {}
  InvalidToken: {}
}>

interface StateDefinition extends Data.TaggedEnum.WithGenerics<1> {
  readonly taggedEnum: State<this["A"]>
}

export const State = Data.taggedEnum<StateDefinition>()

export class Unauthorized extends Data.TaggedError("Unauthorized") {}
