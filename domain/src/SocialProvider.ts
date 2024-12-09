import { Brand, Data } from "effect"
import { Email } from "./Email"

export type SocialProvider = Data.TaggedEnum<{
  Google: { email: Email }
}>

export namespace SocialProvider {
  export const { Google, $match: match } = Data.taggedEnum<SocialProvider>()

  const UrlBrand: unique symbol = Symbol.for("SocialProvider/Url")
  export type Url = Brand.Branded<string, typeof UrlBrand>
  export const Url = Brand.nominal<Url>()

  const CodeBrand: unique symbol = Symbol.for("SocialProvider/Code")
  export type Code = Brand.Branded<string, typeof CodeBrand>
  export const Code = Brand.nominal<Code>()

  const StateBrand: unique symbol = Symbol.for("SocialProvider/State")
  export type State = Brand.Branded<string, typeof StateBrand>
  export const State = Brand.nominal<State>()

  export class InvalidCode extends Data.TaggedError("InvalidCode") {}
}
