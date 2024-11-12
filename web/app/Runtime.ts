import { Array, Config, Effect, Layer, Logger, LogLevel, ManagedRuntime, Redacted, Schema } from "effect"
import { SessionCookie } from "./sessions/CookieSessions"
import { SessionSchema } from "./sessions/Sessions"

const NODE_ENV = Config.literal("development", "production")("NODE_ENV").pipe(Config.withDefault("development"))

const LoggerConfig = Config.all({
  level: Config.withDefault(Config.logLevel("LOG_LEVEL"), LogLevel.All),
  type: Config.literal("pretty", "json", "structured", "logFmt")("LOGGER_TYPE").pipe(Config.withDefault("json"))
})

const LoggerLayer = LoggerConfig.pipe(
  Effect.map(({ level, type }) => Logger[type].pipe(Layer.provide(Logger.minimumLogLevel(level)))),
  Layer.unwrapEffect
)

const SessionCookieLayer = SessionCookie.layer(
  {
    secrets: Config.array(Config.redacted(), "SESSION_SECRETS").pipe(Config.withDefault(Array.empty())),
    secure: NODE_ENV.pipe(Config.map((env) => env === "production"))
  },
  Schema.parseJson(SessionSchema)
)

const AppLayer = Layer.mergeAll(LoggerLayer, SessionCookieLayer)

export const runtime = ManagedRuntime.make(AppLayer)
