import { Effect, Layer } from "effect"
import { NodeContext, NodeRuntime } from "@effect/platform-node"
import { PgClient, PgMigrator } from "@effect/sql-pg"
import { fileURLToPath } from "node:url"

export const Database = PgClient.layer({
  database: "wozza"
})

const MigratorLive = PgMigrator.layer({
  loader: PgMigrator.fromFileSystem(fileURLToPath(new URL("migrations", import.meta.url))),
  // Where to put the `_schema.sql` file
  schemaDirectory: "migrations"
}).pipe(Layer.provide(Database))

const EnvLive = Layer.mergeAll(Database, MigratorLive).pipe(Layer.provide(NodeContext.layer))

Effect.void.pipe(Effect.provide(EnvLive), NodeRuntime.runMain)
