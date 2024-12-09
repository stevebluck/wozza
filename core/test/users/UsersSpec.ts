import { describe, it } from "@effect/vitest"
import { Effect, Schema } from "effect"
import { Seed, TestBench } from "../Seeder.ts"
import { Users } from "../../src/users/Users.ts"

export namespace UsersSpec {
  export const run = (bench: TestBench.Seeded<Users>) => {
    describe("Users", () => {
      it.effect.prop("test 1", [Schema.String], (s) => Effect.gen(function* () {}))

      it.scoped("test 1", () =>
        Effect.gen(function* () {
          const { session } = yield* Seed

          console.log({ session })
        }).pipe(Effect.provide(bench))
      )
    })
  }
}
