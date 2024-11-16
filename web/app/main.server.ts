import { Handler, HttpMiddleware } from "@wozza/react-router-effect"
import { Config, Effect, Layer, Logger, LogLevel, ManagedRuntime } from "effect"
import { Users } from "./services/Users"
import { SessionCookie } from "./services/Sessions"

const LoggerLive = Layer.unwrapEffect(
  Effect.gen(function* () {
    const config = yield* Config.all({
      level: Config.withDefault(Config.logLevel("LOG_LEVEL"), LogLevel.All),
      type: Config.literal("pretty", "json", "structured", "logFmt")("LOGGER_TYPE").pipe(Config.withDefault("json"))
    })

    return Layer.provide(Logger[config.type], Logger.minimumLogLevel(config.level))
  })
)

const AppLayer = Layer.mergeAll(LoggerLive, SessionCookie.layer).pipe(Layer.provideMerge(Users.Reference))

const runtime = ManagedRuntime.make(AppLayer)

const middleware = <A, E, R>(handler: Handler.Handler<A, E, R>) =>
  handler.pipe(HttpMiddleware.withLogger, SessionCookie.middleware)

export const Loader = {
  fromEffect: Handler.fromEffect({ runtime, middleware }),
  unwrapEffect: Handler.unwrapEffect({ runtime, middleware })
}
