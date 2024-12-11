import { PgClient } from "@effect/sql-pg"
import { layer } from "@effect/vitest"
import { PostgreSqlContainer } from "@testcontainers/postgresql"
import { Effect, Redacted } from "effect"
import { Layer } from "effect"

export class TestContainer extends Effect.Service<TestContainer>()("test/TestContainer", {
  scoped: Effect.acquireRelease(
    Effect.promise(() => new PostgreSqlContainer("postgres:alpine").start()),
    (container) => Effect.promise(() => container.stop())
  )
}) {
  static Database = Layer.unwrapEffect(
    Effect.gen(function* () {
      const container = yield* TestContainer

      return PgClient.layer({
        url: Redacted.make(container.getConnectionUri()),
        onnotice: () => {}
      })
    })
  )

  static middleware = layer(TestContainer.Default, { timeout: "1 minute" })
}
