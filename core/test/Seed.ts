import { Email, Password } from "@wozza/domain"
import { Effect } from "effect"
import { Users } from "../src/users/Users"

export class Seed extends Effect.Service<Seed>()("test/Seed", {
  effect: Effect.gen(function* () {
    const users = yield* Users

    const session = yield* users.register(Email.make("test@test.com"), Password.Strong.make("password"))

    return { session }
  })
}) {
  static layer = Seed.Default
}
