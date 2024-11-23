import { PgClient } from "@effect/sql-pg"

export const Database = PgClient.layer({
  database: "wozza"
})
