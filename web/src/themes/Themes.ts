import { Cookie, HttpResponse } from "@wozza/react-router-effect"
import { Effect, Schema } from "effect"
import { HttpServerRequest } from "@effect/platform"

export type Theme = (typeof Theme)[keyof typeof Theme]
export const Theme = {
  Light: "light",
  Dark: "dark"
} as const

class ThemeCookie extends Effect.Service<ThemeCookie>()("@app/ThemeCookie", {
  succeed: Cookie.make({
    name: "app:theme",
    maxAge: "30 days",
    path: "/",
    schema: Schema.compose(Schema.String, Schema.Literal(...Object.values(Theme))),
    httpOnly: true
  })
}) {}

export class Themes extends Effect.Service<Themes>()("@app/Themes", {
  dependencies: [ThemeCookie.Default],
  effect: Effect.gen(function* () {
    const cookie = yield* ThemeCookie

    return {
      get: Effect.gen(function* () {
        const request = yield* HttpServerRequest.HttpServerRequest
        return yield* cookie.parse(request.cookies[cookie.settings.name]).pipe(Effect.orElseSucceed(() => Theme.Light))
      }),
      set: (theme: Theme) => {
        return Effect.gen(function* () {
          const response = yield* HttpResponse
          yield* response.setCookie(cookie, theme)
        })
      }
    }
  })
}) {}
