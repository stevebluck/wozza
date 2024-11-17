import { Schema } from "effect"
import { Id } from "./Id"

export interface Identified<A> {
  value: A
  id: Id<A>
}

export namespace Identified {
  export const make = <A>(value: A, id: Id<A>): Identified<A> => ({ value, id })

  export const schema = <A, I>(a: Schema.Schema<A, I>): Schema.Schema<Identified<A>, { value: I; id: string }> =>
    Schema.Struct({ value: a, id: Id.schema<A>() })
}
