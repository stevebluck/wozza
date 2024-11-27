import * as Sessions from "./auth/Sessions"
import { Handler, Middleware } from "@wozza/react-router-effect"
import { runtime } from "./runtime"
import * as Themes from "./themes/Themes"
type Provided<T extends readonly Middleware.Middleware<any, any>[]> = { [k in keyof T]: T[k] extends Middleware.Middleware<infer R> ? R: never }[number]
type Required<T extends readonly Middleware.Middleware<any, any>[]> = { [k in keyof T]: T[k] extends Middleware.Middleware<any, infer R> ? R: never }[number]

const middlewares = <M extends readonly Middleware.Middleware<any>[]>(...middlewares: M) => <A, R>(handler: Handler.Handler<A, R>) => 
  middlewares.reduce((handler, middleware) => middleware(handler) as any, handler) as Handler.Handler<A, Required<typeof middlewares> | Exclude<R, Provided<typeof middlewares>>>


const middleware = middlewares(Middleware.withLogger, Sessions.withSessions, Themes.withThemes)

export const Loader = {
  fromEffect: Handler.fromEffect({ runtime, middleware }),
  unwrapEffect: Handler.unwrapEffect({ runtime, middleware })
}
