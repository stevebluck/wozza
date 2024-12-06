import { Data, Schema } from "effect"
import { Email } from "./Email"
import { FirstName, LastName, Picture } from "./User"

export type Credentials = Data.TaggedEnum<{
  OAuth: OAuthCredentials
}>

export const Credentials = Data.taggedEnum<Credentials>()

export class OAuthCredentials extends Schema.Class<OAuthCredentials>("OAuthCredentials")({
  provider: Schema.Literal("google"),
  email: Email,
  firstName: Schema.OptionFromSelf(FirstName),
  lastName: Schema.OptionFromSelf(LastName),
  picture: Schema.OptionFromSelf(Picture)
}) {}

export class InvalidCredentials extends Data.TaggedError("InvalidCredentials") {}
export class CredentialsAlreadyExist extends Data.TaggedError("CredentialsAlreadyExist") {}
