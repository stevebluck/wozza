import { Effect } from "effect"
import { HttpServerRequest } from "@effect/platform/HttpServerRequest"
import { Result } from "./Result"
import { Handler } from "./Handler"

export const withLogger: Handler.Middleware = (handler) =>
  Effect.gen(function* () {
    const request = yield* HttpServerRequest

    const result = yield* handler

    yield* Result.match(result, {
      Json: () => Effect.logInfo("HTTP response"),
      Redirect: (r) => Effect.logInfo("HTTP redirect").pipe(Effect.annotateLogs("http.location", r.location)),
      Exception: (r) => Effect.logInfo("HTTP failed response", r.error)
    }).pipe(
      Effect.annotateLogs("http.url", request.url),
      Effect.annotateLogs("http.method", request.method),
      Effect.annotateLogs("http.status", result.init.status)
    )

    return result
  })
