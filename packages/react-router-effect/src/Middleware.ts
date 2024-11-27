import { Effect } from "effect"
import { HttpServerRequest } from "@effect/platform/HttpServerRequest"
import * as Result from "./Result"
import type { Handler } from "./Handler"

export type Middleware<Provided=never, R2=never> = <A, R>(handler: Handler<A, R>) => Handler<A, R2 | Exclude<R, Provided>>

type Provided<T extends readonly Middleware<any, any>[]> = { [k in keyof T]: T[k] extends Middleware<infer R> ? R: never }[number]
type Required<T extends readonly Middleware<any, any>[]> = { [k in keyof T]: T[k] extends Middleware<any, infer R> ? R: never }[number]

export const middlewares = <M extends readonly Middleware<any>[]>(...middlewares: M) => <A, R>(handler: Handler<A, R>) => 
  middlewares.reduce((handler, middleware) => middleware(handler) as any, handler) as Handler<A, Required<typeof middlewares> | Exclude<R, Provided<typeof middlewares>>>


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
export const withLogger: Middleware = (handler) =>
  Effect.gen(function* () {
    const request = yield* HttpServerRequest

    const result = yield* handler

    yield* Result.match(result, {
      Json: () => Effect.logInfo("HTTP response"),
      Redirect: (r) => Effect.logInfo("HTTP redirect").pipe(Effect.annotateLogs("http.location", r.location))
    }).pipe(
      Effect.annotateLogs("http.url", request.url),
      Effect.annotateLogs("http.method", request.method),
      Effect.annotateLogs("http.status", result.init.status)
    )

    return result
  })
