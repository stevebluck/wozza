import { Headers, HttpServerRequest } from "@effect/platform"
import { Effect, Either, identity, ManagedRuntime } from "effect"
import { data, LoaderFunctionArgs, redirect, UNSAFE_DataWithResponseInit } from "react-router"
import { HttpResponseState } from "./HttpResponseState"
import { Scope } from "effect/Scope"
import * as Result from "./Result"

export type RequestContext = HttpServerRequest.HttpServerRequest | HttpResponseState | Scope

export type Handler<A, E = never, R = never> = Effect.Effect<Result.Result<A>, E, R | RequestContext>

export type LoaderHandler<A> = (args: LoaderFunctionArgs) => Promise<UNSAFE_DataWithResponseInit<A>>

type Setup<RR, RE, A, E, R extends RR, AM, EM, Provided> = {
  runtime: ManagedRuntime.ManagedRuntime<RR, RE>
  middleware: (self: Handler<A, E, R>) => Handler<AM, EM, Exclude<R, Provided>>
}

export const fromEffect =
  <RR, RE, A, E, R extends RR, AM, EM, Provided>(setup: Setup<RR, RE, A, E, R, AM, EM, Provided>) =>
  (handler: Handler<A, E, R | Provided>): LoaderHandler<AM> => {
    const app = Effect.gen(function* () {
      const result = yield* handler.pipe(
        // @ts-expect-error
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

    return (args) => {
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
        Effect.scoped,
        Effect.withLogSpan("http")
      )

      return setup.runtime.runPromise(runnable).then(Either.getOrThrowWith(identity))
    }
  }

export const unwrapEffect =
  <RR, RE, A, E, R extends RR, AM, EM, Provided>(setup: Setup<RR, RE, A, E, R, AM, EM, Provided>) =>
  (handler: Effect.Effect<Handler<A, E, R | Provided>, never, RR>): LoaderHandler<AM> => {
    const handlerPromise = setup.runtime.runPromise(handler)
    return async (args) => {
      return handlerPromise.then((app) => fromEffect(setup)(app)(args))
    }
  }
