import { Context, Effect } from "effect"
import { HttpServerRequest } from "@effect/platform/HttpServerRequest"
import { Handler } from "./Handler"
import { SessionStorage } from "../sessions/SessionStorage"
import { RequestSessions } from "../sessions/RequestSessions"
import * as Result from "./Result"

/**
 * @name withLogger
 *
 * @description
 * Middleware that adds log annotations for HTTP requests and responses
 *
 * Logs the following data points:
 * - Request URL, method, status
 * - Redirect location (for redirects)
 * - Error details (for exceptions)
 */
export const withLogger = <A, E, R>(handler: Handler<A, E, R>): Handler<A, E, R> =>
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
