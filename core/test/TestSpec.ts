import { Vitest } from "@effect/vitest"
import { Layer } from "effect"
import { Seed } from "./Seed"

export interface TestSpec<Deps> {
  <A>({ layer, it }: { layer: Layer.Layer<Deps, any, A>; it: Vitest.Methods<A> }): void
}

export namespace TestSpec {
  export interface Seeded<Deps> {
    <A>({ layer, it }: { layer: Layer.Layer<Deps | Seed, any, A>; it: Vitest.Methods<A> }): void
  }
}
