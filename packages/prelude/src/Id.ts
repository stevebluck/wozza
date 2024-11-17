import { Effect, Schema } from "effect"
import { customAlphabet, nanoid } from "nanoid"
import { v4 } from "uuid"
import { Phantom } from "./Phantom"

export type Id<A> = Phantom<A, string, "Id">

export namespace Id {
  export const schema = <A>() => Phantom.schema<Id<A>>(Schema.String)

  export const make = <A>(value: string): Id<A> => Phantom.make<Id<A>>()(value)

  export const makeRandom = <A>(): Effect.Effect<Id<A>> => Effect.sync(() => make(v4()))

  export const makeNanoId = <A>(): Effect.Effect<Id<A>> => Effect.sync(() => make(nanoid()))

  const prefixAlphabet = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 20)

  export const makePrefixed = <P extends string, A>(prefix: P): Effect.Effect<Id<A>> =>
    Effect.sync(() => make(`${prefix}_${prefixAlphabet()}`))
}
