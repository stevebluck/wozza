import { Headers, HttpServerRequest } from "@effect/platform"
import { Effect, Either, identity, Layer, ManagedRuntime } from "effect"
import { data, LoaderFunctionArgs, redirect, UNSAFE_DataWithResponseInit } from "react-router"

import { Result } from "./Result"
import { HttpResponseState } from "../http/HttpResponseState"
import { Scope } from "effect/Scope"

export type RequestContext<R> = HttpServerRequest.HttpServerRequest | HttpResponseState | Scope | R

export type Handler<A, E, R = never> = Effect.Effect<Result<A, E>, never, RequestContext<R>>

export type Middleware<R> = <A, E>(handler: Handler<A, E, R>) => Handler<A, E, R>

export type RequestLayer<Out, E, In> = Layer.Layer<Out, E, RequestContext<In>>

type Setup<R, ER, RR, ERR> = {
  runtime: ManagedRuntime.ManagedRuntime<R, ER>
  requestLayer: RequestLayer<RR, ERR, R>
  middleware: Middleware<R | RR>
}

const initialise =
  <R, ER, RR, ERR>(setup: Setup<R, ER, RR, ERR>) =>
  <A, E>(handler: Handler<A, E, R | RR>) => {
    const app = Effect.gen(function* () {
      const result = yield* handler.pipe(
        Effect.catchAllDefect((defect) => Effect.succeed(Result.Exception(defect, { status: 500 }))),
        setup.middleware
      )

      const responseState = yield* HttpResponseState
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
        Effect.provide(setup.requestLayer),
        Effect.provideServiceEffect(HttpResponseState, HttpResponseState.make),
        Effect.provideService(HttpServerRequest.HttpServerRequest, HttpServerRequest.fromWeb(args.request)),
        Effect.provideServiceEffect(
          HttpServerRequest.ParsedSearchParams,
          Effect.try(() => new URL(args.request.url)).pipe(
            Effect.map(HttpServerRequest.searchParamsFromURL),
            Effect.orDie
          )
        ),
        Effect.scoped,
        Effect.withLogSpan("http")
      )

      return setup.runtime.runPromise(runnable).then(Either.getOrThrowWith(identity))
    }
  }

export const effect =
  <R, ER, RR, ERR>(setup: Setup<R, ER, RR, ERR>) =>
  <A, E>(handler: Handler<A, E, R | RR>) => {
    const makeHandler = initialise(setup)
    return makeHandler(handler)
  }

export const unwrapEffect =
  <R, ER, RR, ERR>(setup: Setup<R, ER, RR, ERR>) =>
  <A, E>(effect: Effect.Effect<Handler<A, E, RR>, never, R>) => {
    const promise = setup.runtime.runPromise(effect)
    const makeHandler = initialise(setup)
    return (args: LoaderFunctionArgs) => promise.then((handler) => makeHandler(handler)(args))
  }

/**
 * @description Creates a request handler factory with the given setup configuration.
 *
 * @param setup Configuration object containing:
 *     - `runtime`: A ManagedRuntime for executing effects
 *     - `requestLayer`: A layer providing request-scoped dependencies
 *     - `middleware`: Request middleware for transforming handlers
 *
 * @returns An object with two methods:
 *     - `effect`: Creates a handler from an Effect that runs per-request
 *     - `unwrapEffect`: Creates a handler from an Effect that runs once during initialization
 *
 * @example
 * ```ts
 * const Loader = Handler.make({
 *     runtime: Runtime.make(appLayer),
 *     requestLayer: Layer.empty,
 *     middleware: Middleware.compose(Middleware.withLogger, Middleware.withAuth)
 * })
 * ```
 */
export const make = <R, ER, RR, ERR>(setup: Setup<R, ER, RR, ERR>) => ({
  /**
   * @name effect
   *
   * @description
   * Creates a React Router server loader or action from an Effect.
   *
   * @example
   * ```ts
   * const handler = Loader.effect(Effect.gen(function* () {
   *   const request = yield* HttpServerRequest.HttpServerRequest
   *   const result = yield* processRequest(request)
   *   return Result.Ok(result)
   * }))
   * ```
   */
  effect: effect(setup),
  /**
   * @name unwrapEffect
   *
   * @description
   * Creates a request React Router server loader or action from an Effect that initialises resources.
   *
   * The outer Effect runs once during initialisation which is useful for setup tasks,
   * while the inner Effect runs for each request.
   *
   * @example
   * ```ts
   * const handler = Loader.unwrapEffect(Effect.gen(function* () {
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
  unwrapEffect: unwrapEffect(setup)
})
