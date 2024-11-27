import { Cookie, HttpResponse } from "@wozza/react-router-effect"
import { Context, Effect, Schema } from "effect"
import { HttpServerRequest } from "@effect/platform"

export type Theme = (typeof Theme)[keyof typeof Theme]
export const Theme = {
  Light: "light",
  Dark: "dark"
} as const

export class ThemeCookie extends Effect.Service<ThemeCookie>()("@app/ThemeCookie", {
  succeed: Cookie.make({
    name: "app:theme",
    maxAge: "30 days",
    path: "/",
    schema: Schema.compose(Schema.String, Schema.Literal(...Object.values(Theme))),
    httpOnly: true
  })
}) {}

export class Themes extends Context.Tag("@app/Themes")<
  Themes,
  {
    get: Effect.Effect<Theme>
    set: (theme: Theme) => Effect.Effect<void>
  }
>() {
  static make = Effect.gen(function* () {
    const cookie = yield* ThemeCookie
    const response = yield* HttpResponse
    const request = yield* HttpServerRequest.HttpServerRequest

    return {
      get: cookie.parse(request.cookies[cookie.settings.name]).pipe(Effect.orElseSucceed(() => Theme.Light)),
      set: (theme: Theme) => response.setCookie(cookie, theme)
    }
  })
}

export const withThemes = Effect.provideServiceEffect(Themes, Themes.make)
