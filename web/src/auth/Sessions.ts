import { Middleware, Result } from "@wozza/react-router-effect"
import { Context, Data, Effect, Option, Ref } from "effect"
import { Session } from "@wozza/domain"

const make = (state: SessionState) =>
  Effect.gen(function* () {
    const requestSession = yield* Ref.make<SessionState>(state)

    return {
      get: requestSession.get,
      mint: (session: Session) => Ref.set(requestSession, SessionState.Set({ session })),
      set: (_: SessionState) => Ref.set(requestSession, _),
      invalidate: Ref.set(requestSession, SessionState.Unset())
    }
  })

export class Sessions extends Effect.Tag("@app/Sessions")<Sessions, Effect.Effect.Success<ReturnType<typeof make>>>() {
  static make = make

  static authenticated: Middleware.Middleware<CurrentSession, Sessions> = (handler) =>
    Sessions.pipe(
      Effect.flatMap((sessions) => sessions.get),
      Effect.flatMap(
        SessionState.$match({
          Provided: ({ session }) => Option.some(session),
          Set: ({ session }) => Option.some(session),
          Unset: () => Option.none(),
          NotProvided: () => Option.none(),
          InvalidToken: () => Option.none()
        })
      ),
      Effect.mapError(() => Result.Redirect("/login")),
      Effect.flatMap((session) => handler.pipe(Effect.provideService(CurrentSession, session))),
      Effect.merge
    )

  static guest: Middleware.Middleware<never, Sessions> = (handler) =>
    Sessions.pipe(
      Effect.flatMap((sessions) => sessions.get),
      Effect.flatMap(
        SessionState.$match({
          Provided: () => Option.none(),
          Set: () => Option.none(),
          Unset: () => Option.some(null),
          NotProvided: () => Option.some(null),
          InvalidToken: () => Option.some(null)
        })
      ),
      Effect.mapError(() => Result.Redirect("/")),
      Effect.flatMap(() => handler),
      Effect.merge
    )
}

export type SessionState = Data.TaggedEnum<{
  Provided: { session: Session }
  NotProvided: {}
  Set: { session: Session }
  Unset: {}
  InvalidToken: {}
}>

export const SessionState = Data.taggedEnum<SessionState>()

export class CurrentSession extends Context.Tag("@app/CurrentSession")<CurrentSession, Session>() {}
