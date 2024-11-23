import { Headers, HttpServerRequest } from "@effect/platform"
import { Cause, Effect, Either, Exit, identity, ManagedRuntime } from "effect"
import { ActionFunctionArgs, data, LoaderFunctionArgs, redirect, UNSAFE_DataWithResponseInit } from "react-router"
import { Scope } from "effect/Scope"
import { HttpResponse } from "./HttpResponse"
import * as Result from "./Result"

export type RequestContext = HttpServerRequest.HttpServerRequest | HttpResponse | Scope

export type Handler<A, R = never> = Effect.Effect<Result.Result<A>, never, R | RequestContext>

export type ReactRouterHandler<A> = (
  args: LoaderFunctionArgs | ActionFunctionArgs
) => Promise<UNSAFE_DataWithResponseInit<A>>

type Setup<RR, RE, A, R, AM, Provided> = {
  runtime: ManagedRuntime.ManagedRuntime<RR, RE>
  middleware: (self: Handler<A, R>) => Handler<AM, Exclude<R, Provided>>
}

export const fromEffect =
  <RR, RE, A, R extends RR, AM, Provided>(setup: Setup<RR, RE, A, R, AM, Provided>) =>
  (handler: Handler<A, R | Provided>): ReactRouterHandler<AM> => {
    const app = Effect.gen(function* () {
      // @ts-expect-error
      const result = yield* setup.middleware(handler)

      const response = yield* HttpResponse
      const init = yield* response.init
      const headers = Headers.merge(init.headers, Headers.fromInput(result.init?.headers))

      return Result.match(result, {
        Json: (r) => Either.right(data(r.value, { ...r.init, headers })),
        Redirect: (r) => Either.left(redirect(r.location, { ...r.init, headers }))
      })
    })

    return (args) => {
      const runnable = app.pipe(
        Effect.provideService(HttpServerRequest.HttpServerRequest, HttpServerRequest.fromWeb(args.request)),
        Effect.provideServiceEffect(HttpResponse, HttpResponse.make),
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

      return run(setup.runtime, runnable)
    }
  }

export const unwrapEffect =
  <RR, RE, A, R extends RR, AM, Provided>(setup: Setup<RR, RE, A, R, AM, Provided>) =>
  (handler: Effect.Effect<Handler<A, R | Provided>, never, RR>): ReactRouterHandler<AM> => {
    const handlerPromise = setup.runtime.runPromise(handler)
    return async (args) => {
      return handlerPromise.then((app) => fromEffect(setup)(app)(args))
    }
  }

const run = <A, E, R, RE>(
  runtime: ManagedRuntime.ManagedRuntime<R, RE>,
  handler: Effect.Effect<Either.Either<A, E>, never, R>
) =>
  runtime.runPromiseExit(handler).then(
    Exit.match({
      onFailure: (cause) => {
        console.error("Runtime error", Cause.pretty(cause))
        throw new Response("Internal Server Error", { status: 500 })
      },
      onSuccess: Either.getOrThrowWith(identity)
    })
  )
