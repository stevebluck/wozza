import { Layer } from "effect"
import { NodeContext } from "@effect/platform-node"
import { PgMigrator } from "@effect/sql-pg"
import { fileURLToPath } from "node:url"

export const Migrator = PgMigrator.layer({
  loader: PgMigrator.fromFileSystem(fileURLToPath(new URL("migrations", import.meta.url))),
  schemaDirectory: "src/persistence"
}).pipe(Layer.provide(NodeContext.layer))
