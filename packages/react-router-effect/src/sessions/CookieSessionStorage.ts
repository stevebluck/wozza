import { Effect, Layer, Schema } from "effect"
import * as SessionStorage from "./SessionStorage"
import { State } from "./RequestSessions"
import * as Cookie from "../handler/Cookie"
import * as HttpRequest from "../handler/HttpRequest"
import * as HttpResponse from "../handler/HttpResponse"

export const make = (makeCookie: Effect.Effect<Cookie.Cookie<any>>): Effect.Effect<SessionStorage.Service> =>
  Effect.gen(function* () {
    const cookie = yield* makeCookie

    return {
      createSessionsState: HttpRequest.getCookieHeader.pipe(
        Effect.flatMap(() => HttpRequest.parseCookie(cookie)),
        Effect.map((session) => State.Provided({ value: session })),
        Effect.catchTags({
          CookieHeaderNotFound: () => Effect.succeed(State.NotProvided()),
          ParseError: () => Effect.succeed(State.InvalidToken()),
          CookieError: () => Effect.succeed(State.NotProvided())
        })
      ),
      save: State.$match({
        Set: (s) => HttpResponse.setCookie(cookie, s.value),
        Unset: () => HttpResponse.unsetCookie(cookie),
        NotProvided: () => Effect.void,
        Provided: () => Effect.void,
        InvalidToken: () => HttpResponse.unsetCookie(cookie)
      })
    }
  })

export const layer = <A, I>(name: string, schema: Schema.Schema<A, I>): Layer.Layer<SessionStorage.SessionStorage> => {
  return Layer.effect(SessionStorage.SessionStorage, make(Cookie.make(name, Schema.parseJson(schema))))
}
