import { Email, Password, Session } from "@wozza/domain"
import { Context, Effect, Layer, Scope } from "effect"
import { Users } from "../src/users/Users"
import { ReferenceUsers } from "../src/users/ReferenceUsers"

export interface Seed {
  session: Session
}

export const makeSeed = Effect.gen(function* () {
  const users = yield* Users

  const session = yield* users.register(Email.make("test@test.com"), Password.Strong.make("password"))

  return { session }
}).pipe(Effect.orDie)

export const Seed = Context.GenericTag<Seed>("@test/seeder")

export const ReferenceSeeder = Layer.effect(Seed, makeSeed).pipe(Layer.provide(ReferenceUsers.layer))

export interface TestBench<R> extends Layer.Layer<R> {}

export namespace TestBench {
  export interface Seeded<R> extends TestBench<Seed | R> {}
}
