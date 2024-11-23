import { Config, Data, Effect, Layer, Logger, LogLevel, ManagedRuntime } from "effect"
import { Users } from "./users/Users"
import { NodeFileSystem } from "@effect/platform-node"
import { Path } from "@effect/platform"
import { SessionCookie } from "./auth/Sessions"

type AppConfig = Data.TaggedEnum<{
  Production: {}
  DevPersisted: {}
  DevInMemory: {}
}>

const AppConfig = Data.taggedEnum<AppConfig>()

type Production = Data.TaggedEnum.Value<AppConfig, "Production">
type DevPersisted = Data.TaggedEnum.Value<AppConfig, "DevPersisted">
type DevInMemory = Data.TaggedEnum.Value<AppConfig, "DevInMemory">

const ProductionConfig: Config.Config<Production> = Config.all({
  mode: Config.literal("Production")("MODE")
}).pipe(Config.map(AppConfig.Production))

const DevPersistedConfig: Config.Config<DevPersisted> = Config.all({
  mode: Config.literal("DevPersisted")("MODE")
}).pipe(Config.map(AppConfig.DevPersisted))

const DevInMemoryConfig: Config.Config<DevInMemory> = Config.all({
  mode: Config.literal("DevInMemory")("MODE")
}).pipe(Config.map(AppConfig.DevInMemory))

const CapabilitiesLayer = Layer.unwrapEffect(
  Effect.gen(function* () {
    const config = yield* ProductionConfig.pipe(
      Config.orElse(() => DevPersistedConfig),
      Config.orElse(() => DevInMemoryConfig)
    )

    yield* Effect.logInfo(`Running in mode: ${config}`)

    return AppConfig.$match(config, {
      Production: () => Layer.mergeAll(Users.Rdbms),
      DevPersisted: () => Layer.mergeAll(Users.Rdbms),
      DevInMemory: () => Layer.mergeAll(Users.Reference)
    })
  })
)

const LoggerLayer = Layer.unwrapEffect(
  Effect.gen(function* () {
    const config = yield* Config.all({
      level: Config.withDefault(Config.logLevel("LOG_LEVEL"), LogLevel.All),
      type: Config.literal("pretty", "json", "structured", "logFmt")("LOGGER_TYPE").pipe(Config.withDefault("json"))
    })

    return Layer.provide(Logger[config.type], Logger.minimumLogLevel(config.level))
  })
)

const AppLayer = Layer.mergeAll(SessionCookie.layer).pipe(
  Layer.provideMerge(CapabilitiesLayer),
  Layer.merge(Path.layer),
  Layer.merge(NodeFileSystem.layer),
  Layer.provide(LoggerLayer)
)

export const runtime = ManagedRuntime.make(AppLayer)
