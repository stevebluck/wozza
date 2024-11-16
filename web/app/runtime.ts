import { Config, Effect, Layer, Logger, LogLevel, ManagedRuntime } from "effect"
import { Users } from "./services/Users"
import { SessionCookie } from "./services/Sessions"

const LoggerLayer = Layer.unwrapEffect(
  Effect.gen(function* () {
    const config = yield* Config.all({
      level: Config.withDefault(Config.logLevel("LOG_LEVEL"), LogLevel.All),
      type: Config.literal("pretty", "json", "structured", "logFmt")("LOGGER_TYPE").pipe(Config.withDefault("json"))
    })

    return Layer.provide(Logger[config.type], Logger.minimumLogLevel(config.level))
  })
)

const baseConfig = {
  databaseUrl: Config.nonEmptyString("DATABASE_URL")
}

const Production = Layer.unwrapEffect(
  Effect.gen(function* () {
    const config = yield* Config.all({
      mode: Config.literal("Production")("MODE"),
      databaseUrl: baseConfig.databaseUrl
    })

    yield* Effect.logInfo(`Running in mode: ${config.mode}`)

    return Layer.mergeAll(Users.Rdbms)
  })
)

const DevPersisted = Layer.unwrapEffect(
  Effect.gen(function* () {
    const config = yield* Config.all({
      mode: Config.literal("DevPersisted")("MODE"),
      databaseUrl: baseConfig.databaseUrl
    })

    yield* Effect.logInfo(`Running in mode: ${config.mode}`)

    return Layer.mergeAll(Users.Rdbms)
  })
)

const DevInMemory = Layer.unwrapEffect(
  Effect.gen(function* () {
    const config = yield* Config.all({
      mode: Config.literal("DevInMemory")("MODE")
    })

    yield* Effect.logInfo(`Running in mode: ${config.mode}`)

    return Layer.mergeAll(Users.Reference)
  })
)

const AppLayer = SessionCookie.layer.pipe(
  Layer.provideMerge(
    Production.pipe(
      Layer.orElse(() => DevPersisted),
      Layer.orElse(() => DevInMemory)
    )
  ),
  Layer.provide(LoggerLayer)
)

export const runtime = ManagedRuntime.make(AppLayer)
