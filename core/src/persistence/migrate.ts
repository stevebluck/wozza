import { Effect, Layer } from "effect"
import { NodeRuntime } from "@effect/platform-node"
import { Migrator } from "./Migrator"
import { PgClient } from "@effect/sql-pg"

const Database = PgClient.layer({
  database: "wozza"
})

const EnvLive = Migrator.pipe(Layer.provide(Database))

Effect.void.pipe(Effect.provide(EnvLive), NodeRuntime.runMain)
