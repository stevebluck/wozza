import * as Sessions from "./auth/Sessions"
import { Handler, Middleware } from "@wozza/react-router-effect"
import { runtime } from "./runtime"
import * as Themes from "./themes/Themes"
import { Context} from "effect"

type Middleware<R2> = {
  provides: Context.Tag<any, any> | undefined
  handler: <A,R>(handler: Handler.Handler<A, R>) => Handler.Handler<A, R2>
}
type Middlewares<T extends readonly Middleware<any>[]> = { [k in keyof T]: T[k]["provides"] extends Context.Tag<any, any> ? Context.Tag.Identifier<T[k]["provides"]> : never }[number]

const middlewares = <M extends readonly Middleware<any>[]>(...middlewares: M) => <A, R>(handler: Handler.Handler<A, R>) => 
  middlewares.reduce((handler, middleware) => middleware.handler(handler) as any, handler) as Handler.Handler<A, Exclude<R, Middlewares<typeof middlewares>>>


const middleware = middlewares(Middleware.withLogger, Sessions.withSessions, Themes.withThemes)

export const Loader = {
  fromEffect: Handler.fromEffect({ runtime, middleware }),
  unwrapEffect: Handler.unwrapEffect({ runtime, middleware })
}
