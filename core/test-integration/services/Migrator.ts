import { SqlClient } from "@effect/sql"
import { Effect } from "effect"
import { Layer } from "effect"
import fs from "fs"
import path from "path"

const migrate = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient

  const schema = fs.readFileSync(path.join(__dirname, "../../../core/src/persistence/_schema.sql"), "utf-8")

  yield* sql.unsafe(schema)
})

const dropTables = () =>
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient

    yield* sql`DROP SCHEMA ${sql("wozza")} CASCADE;`
    yield* sql`DROP TABLE ${sql("effect_sql_migrations")};`
  }).pipe(Effect.orDie)

export const Migrator = Layer.scopedDiscard(Effect.acquireRelease(migrate, dropTables))
