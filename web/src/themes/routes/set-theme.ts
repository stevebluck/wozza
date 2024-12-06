import { HttpServerRequest } from "@effect/platform"
import { Result } from "@wozza/react-router-effect"
import { Effect, Schema } from "effect"
import { Loader } from "~/main.server"
import { ThemeFromString } from "../Theme"
import { Themes } from "../Themes"

export const action = Effect.gen(function* () {
  const themes = yield* Themes

  return yield* HttpServerRequest.schemaBodyUrlParams(Schema.Struct({ theme: ThemeFromString })).pipe(
    Effect.orDie,
    Effect.tap(({ theme }) => themes.set(theme)),
    Effect.map(Result.Json)
  )
}).pipe(Loader.fromEffect)
