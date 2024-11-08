import { Cookie, Handler, Middleware } from "@wozza/react-router-effect"
import { Config, Effect, Layer, Logger, LogLevel, ManagedRuntime } from "effect"

const LoggerConfig = Config.all({
  level: Config.withDefault(Config.logLevel("LOG_LEVEL"), LogLevel.All),
  type: Config.literal("pretty", "json", "structured", "logFmt")("LOGGER_TYPE").pipe(Config.withDefault("json"))
})

const AppLogger = LoggerConfig.pipe(
  Effect.map(({ level, type }) => Logger[type].pipe(Layer.provide(Logger.minimumLogLevel(level)))),
  Layer.unwrapEffect
)

const AppLayer = Layer.mergeAll(AppLogger, Cookie.CookieConfig.default)

const runtime = ManagedRuntime.make(AppLayer)

export const Loader = Handler.make({
  runtime,
  requestLayer: Layer.empty,
  middleware: Middleware.compose(Middleware.withLogger)
})
