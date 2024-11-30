import { Cookie, HttpResponse } from "@wozza/react-router-effect"
import { Effect } from "effect"
import { HttpServerRequest } from "@effect/platform"
import { Theme, ThemeFromString } from "./Theme"

export class Themes extends Effect.Service<Themes>()("@app/Themes", {
  effect: Effect.gen(function* () {
    const cookie = Cookie.make({
      name: "app:theme",
      maxAge: "30 days",
      path: "/",
      schema: ThemeFromString,
      httpOnly: true
    })

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
