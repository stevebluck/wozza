import { describe } from "@effect/vitest"
import { Effect, Schema } from "effect"
import { Seed } from "../Seed.ts"
import { Users } from "../../src/users/Users.ts"
import { TestSpec } from "../TestSpec.ts"

const spec: TestSpec.Seeded<Users> = ({ layer, it }) => {
  describe("Users", () => {
    it.effect.prop("test 1", [Schema.String], (s) => Effect.gen(function* () {}).pipe(Effect.provide(layer)))

    it.effect("test 1", () =>
      Effect.gen(function* () {
        const { session } = yield* Seed
      }).pipe(Effect.provide(layer))
    )
  })
}

export namespace UsersSpec {
  export const run = spec
}
