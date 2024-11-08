import { Headers, HttpServerRequest } from "@effect/platform"
import { Effect, Either, identity, Layer, ManagedRuntime } from "effect"
import { data, LoaderFunctionArgs, redirect, UNSAFE_DataWithResponseInit } from "react-router"

import { Result } from "./Result"
import { HttpResponseState } from "../http/HttpResponseState"

type RequestContext = HttpServerRequest.HttpServerRequest | HttpResponseState

export type Handler<A, E, R = never> = Effect.Effect<Result<A, E>, never, Handler.Context<R>>

export namespace Handler {
  export type Context<R> = RequestContext | R

  export type Middleware = <A, E, R = never>(handler: Handler<A, E, R>) => Handler<A, E, R>
}

const fromLayer = <R, ER>(layer: Layer.Layer<R, ER>, middleware: Handler.Middleware) => {
  const runtime = ManagedRuntime.make(layer)

  const makeHandler = <A, E>(handler: Handler<A, E, R>) => {
    const app = Effect.gen(function* () {
      const responseState = yield* HttpResponseState

      const result = yield* handler.pipe(
        Effect.catchAllDefect((defect) => Effect.succeed(Result.Exception(defect, { status: 500 }))),
        middleware
      )

      const state = yield* responseState.get

      const headers = Headers.merge(state.init.headers)(Headers.fromInput(result.init?.headers))

      return Result.match(result, {
        Json: (r) => Either.right(data(r.value, { ...r.init, headers })),
        Redirect: (r) => Either.left(redirect(r.location, { ...r.init, headers })),
        Exception: (r) => Either.left(new Response("Internal Server Error", { ...r.init, headers }))
      })
    })

    return (args: LoaderFunctionArgs): Promise<UNSAFE_DataWithResponseInit<A>> => {
      const runnable = app.pipe(
        Effect.provideServiceEffect(HttpResponseState, HttpResponseState.make),
        Effect.provideService(HttpServerRequest.HttpServerRequest, HttpServerRequest.fromWeb(args.request)),
        Effect.provideServiceEffect(
          HttpServerRequest.ParsedSearchParams,
          Effect.try(() => new URL(args.request.url)).pipe(
            Effect.map(HttpServerRequest.searchParamsFromURL),
            Effect.orDie
          )
        ),
        Effect.withLogSpan("http")
      )

      const result = runtime.runPromise(runnable).then(Either.getOrThrowWith(identity))

      return result
    }
  }

  return {
    runtime,
    makeHandler
  }
}

const effect = <R, ER>(layer: Layer.Layer<R, ER>, middleware: Handler.Middleware) => {
  const { makeHandler } = fromLayer(layer, middleware)

  return <A, E>(handler: Handler<A, E, R>) => makeHandler(handler)
}

const unwrapEffect = <R, ER>(layer: Layer.Layer<R, ER>, middleware: Handler.Middleware) => {
  const { runtime, makeHandler } = fromLayer(layer, middleware)

  return <A, E>(effect: Effect.Effect<Handler<A, E, R>, never, R>) => {
    const handler = runtime.runPromise(effect)

    return (args: LoaderFunctionArgs) => handler.then((handler) => makeHandler(handler)(args))
  }
}

export const make = <R, ER>(layer: Layer.Layer<R, ER>, middleware: Handler.Middleware) => ({
  /**
   * Creates a request handler from an Effect.
   *
   * The Effect runs for each request, with access to the request context.
   *
   * Example:
   * ```ts
   * const handler = Handler.effect(Effect.gen(function* () {
   *   const request = yield* HttpServerRequest.HttpServerRequest
   *   const result = yield* processRequest(request)
   *   return Result.Ok(result)
   * }))
   * ```
   */
  effect: effect(layer, middleware),
  /**
   * Creates a request handler from an Effect that produces another Effect.
   *
   * The outer Effect runs once during initialization (useful for expensive setup),
   * while the inner Effect runs for each request.
   *
   * Example:
   * ```ts
   * const handler = Handler.unwrapEffect(Effect.gen(function* () {
   *   // Runs once on initialization
   *   const db = yield* initializeDatabase()
   *
   *   // Returns an Effect that runs per-request
   *   return Effect.gen(function* () {
   *     const result = yield* db.query("SELECT * FROM users")
   *     return Result.Ok(result)
   *   })
   * }))
   * ```
   */
  unwrapEffect: unwrapEffect(layer, middleware)
})
