import { Cookie, Handler, HandlerMiddleware } from "@wozza/react-router-effect"
import { Config, Layer, Logger, LogLevel, Redacted } from "effect"

const CookieConfig = Cookie.CookieConfig.layerConfig({
  secrets: Config.array(Config.redacted("COOKIE_ENCRYPTION_SECRET")).pipe(
    Config.withDefault<Array<Redacted.Redacted<string>>>([])
  ),
  secure: Config.nonEmptyString("NODE_ENV").pipe(Config.map((env) => env === "production"))
})

const appLayer = Logger.pretty.pipe(Layer.merge(CookieConfig))

export const Loader = Handler.make(appLayer, (handler) =>
  handler.pipe(HandlerMiddleware.withLogger, Logger.withMinimumLogLevel(LogLevel.Debug))
)
