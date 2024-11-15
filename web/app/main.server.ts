import { Handler, HttpMiddleware, SessionsMiddleware } from "@wozza/react-router-effect"
import { Config, Effect, Layer, Logger, LogLevel, ManagedRuntime } from "effect"
import { SessionStorageLive, Sessions } from "./services/Sessions"

const LoggerConfig = Config.all({
  level: Config.withDefault(Config.logLevel("LOG_LEVEL"), LogLevel.All),
  type: Config.literal("pretty", "json", "structured", "logFmt")("LOGGER_TYPE").pipe(Config.withDefault("json"))
})

const LoggerLayer = LoggerConfig.pipe(
  Effect.map(({ level, type }) => Logger[type].pipe(Layer.provide(Logger.minimumLogLevel(level)))),
  Layer.unwrapEffect
)

const AppLayer = Layer.mergeAll(LoggerLayer, SessionStorageLive)

const runtime = ManagedRuntime.make(AppLayer)

const middleware = <A, E, R>(handler: Handler.Handler<A, E, R>) =>
  handler.pipe(HttpMiddleware.withLogger, SessionsMiddleware.make(Sessions))

export const Loader = {
  fromEffect: Handler.fromEffect({ runtime, middleware }),
  unwrapEffect: Handler.unwrapEffect({ runtime, middleware })
}
