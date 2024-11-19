import { Layer } from "effect"
import { NodeContext } from "@effect/platform-node"
import { PgClient, PgMigrator } from "@effect/sql-pg"
import { fileURLToPath } from "node:url"

const SqlLive = PgClient.layer({
  database: "wozza"
})

const MigratorLive = PgMigrator.layer({
  loader: PgMigrator.fromFileSystem(fileURLToPath(new URL("migrations", import.meta.url))),
  // Where to put the `_schema.sql` file
  schemaDirectory: "migrations"
}).pipe(Layer.provide(SqlLive))

export const Database = SqlLive
