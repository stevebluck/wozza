import { Context, Data, Effect, Layer, Ref } from "effect"

export class RequestSession<T> {
  static make = <T>(state: SessionState<T>): Effect.Effect<RequestSession<T>> =>
    Effect.gen(function* () {
      const ref = yield* Ref.make<SessionState<T>>(state)
      return new RequestSession<T>(ref)
    })

  constructor(private readonly session: Ref.Ref<SessionState<T>>) {}

  get get(): Effect.Effect<SessionState<T>> {
    return this.session.get
  }

  mint = (value: T): Effect.Effect<void> => {
    return Ref.set(this.session, SessionState.Set({ value }))
  }

  set = (session: SessionState<T>): Effect.Effect<void> => {
    return Ref.set(this.session, session)
  }

  get invalidate(): Effect.Effect<void> {
    return Ref.set(this.session, SessionState.Unset())
  }

  get authenticated(): Effect.Effect<T, Unauthorized> {
    return this.session.get.pipe(
      Effect.flatMap(
        SessionState.$match({
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

export type SessionState<T> = Data.TaggedEnum<{
  Provided: { value: T }
  NotProvided: {}
  Set: { value: T }
  Unset: {}
  InvalidToken: {}
}>

interface SessionStateDefinition extends Data.TaggedEnum.WithGenerics<1> {
  readonly taggedEnum: SessionState<this["A"]>
}

export const SessionState = Data.taggedEnum<SessionStateDefinition>()

export class Unauthorized extends Data.TaggedError("Unauthorized") {}
