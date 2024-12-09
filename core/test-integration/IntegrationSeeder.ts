import { Effect, Layer } from "effect"

import { SqlClient } from "@effect/sql"
import { makeSeed, Seed } from "../test/Seeder"
import { Database } from "../src/persistence/Database"
import { RdbmsUsers } from "../src/users/RdbmsUsers"

export const IntegrationSeeder = Layer.scoped(
  Seed,
  Effect.acquireRelease(makeSeed, () =>
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient

      yield* sql`DELETE FROM ${sql("wozza.users")};`.pipe(Effect.orDie)
    })
  )
).pipe(Layer.provide(RdbmsUsers.layer), Layer.provide(Database))
