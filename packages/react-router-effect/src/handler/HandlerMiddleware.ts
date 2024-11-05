import { Effect } from "effect"
import { HttpServerRequest } from "@effect/platform/HttpServerRequest"
import { Result } from "./Result"
import { HttpResponseState } from "../http/HttpResponseState"
import { EffectHandler } from "./Handler"

export const withLogger = <A, E>(handler: EffectHandler<A, E>) =>
  Effect.gen(function* () {
    const response = yield* HttpResponseState
    const request = yield* HttpServerRequest

    const result = yield* handler.pipe(
      Effect.tapDefect((defect) =>
        Effect.logInfo("http failed response sent. This would have caused the ErrorBoundary to be rendered.").pipe(
          Effect.annotateLogs("defect", defect),
          Effect.annotateLogs("http.method", request.method),
          Effect.annotateLogs("http.status", 500)
        )
      )
    )

    const state = yield* response.get

    yield* Result.match(result, {
      Ok: () => Effect.logInfo("http response sent"),
      Error: (e) =>
        Effect.logInfo("http failed response sent. This would have caused the ErrorBoundary to be rendered.").pipe(
          Effect.annotateLogs("http.body", e.error)
        ),
      Redirect: (r) =>
        Effect.logInfo("http redirect response sent").pipe(Effect.annotateLogs("http.location", r.location)),
      Exception: (e) => Effect.logInfo("http exception response sent", e.defect)
    }).pipe(
      Effect.annotateLogs("http.method", request.method),
      Effect.annotateLogs("http.status", result.init?.status || state.status)
    )

    return result
  }).pipe(Effect.withLogSpan("http"))
