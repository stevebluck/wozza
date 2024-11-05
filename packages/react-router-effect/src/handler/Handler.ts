import { Headers, HttpServerRequest } from "@effect/platform"
import { Effect, Either, identity, Layer, ManagedRuntime } from "effect"
import { data, LoaderFunctionArgs, redirect, UNSAFE_DataWithResponseInit } from "react-router"

import { Result } from "./Result"
import { HttpResponseState } from "../http/HttpResponseState"

type RequestContext<R> =
  | HttpServerRequest.HttpServerRequest
  | HttpServerRequest.ParsedSearchParams
  | HttpResponseState
  | R

export type EffectHandler<A, E, R = never> = Effect.Effect<Result<A, E>, never, RequestContext<R>>

type Options<R> = {
  middleware: <A, E>(handler: EffectHandler<A, E, R>) => EffectHandler<A, E, R>
}

export const make = <R, ER>(layer: Layer.Layer<R, ER>, options: Options<R>) => ({
  effect: effect(layer, options),
  /** 
   An effect that runs only once which then returns an effect that runs at request time.

   E.g.
   ```ts
   const handler = Handler.unwrapEffect(Effect.gen(function* () {
     console.log("I run once")

     return Effect.succeed("I run on each request")
   }))
   ```
   */
  unwrapEffect: unwrapEffect(layer, options)
})

const fromLayer = <R, ER>(layer: Layer.Layer<R, ER>, options: Options<R>) => {
  const runtime = ManagedRuntime.make(layer)

  const makeHandler = <A, E>(handler: EffectHandler<A, E, R>) => {
    const app = Effect.gen(function* () {
      const response = yield* HttpResponseState

      const result = yield* handler.pipe(
        Effect.catchAllDefect((defect) => Effect.succeed(Result.Exception(defect))),
        options.middleware
      )
      const state = yield* response.get
      const init = state.init

      const headers = Headers.merge(init.headers)(Headers.fromInput(result.init?.headers || Headers.empty))
      const status = result.init?.status || init.status
      const responseInit = {
        headers,
        status
      }

      return Result.match(result, {
        Ok: (r) => Either.right(data(r.value, responseInit)),
        Error: (e) => Either.left(data(e.error, responseInit)),
        Redirect: (r) => Either.left(redirect(r.location, { status: r.init?.status || 302, headers })),
        Exception: () => Either.left(data("Internal server error", { status: 500, headers }))
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
        )
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

const effect = <R, ER>(layer: Layer.Layer<R, ER>, options: Options<R>) => {
  const { makeHandler } = fromLayer(layer, options)

  return <A, E>(handler: EffectHandler<A, E, R>) => makeHandler(handler)
}

const unwrapEffect = <R, ER>(layer: Layer.Layer<R, ER>, options: Options<R>) => {
  const { runtime, makeHandler } = fromLayer(layer, options)

  return <A, E>(effect: Effect.Effect<EffectHandler<A, E>, never, R>) => {
    const handler = runtime.runPromise(effect)

    return (args: LoaderFunctionArgs) => handler.then((handler) => makeHandler(handler)(args))
  }
}

export const middleware = <A, E, R = never>(fn: (handler: EffectHandler<A, E, R>) => EffectHandler<A, E, R>) => fn
