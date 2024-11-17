import { Effect, Schema } from "effect"
import { Token } from "../tokens/Tokens"
import { Credentials, CredentialsAlreadyExist, InvalidCredentials } from "../sessions/Credentials"
import { Session } from "../sessions/Session"
import { Email } from "../emails/Email"
import { Id } from "@wozza/prelude"

export interface Users {
  identify: (token: Token<Id<User>>) => Effect.Effect<Session, Token.NoSuchToken>
  register: (credentials: Credentials) => Effect.Effect<Session, CredentialsAlreadyExist>
  authenticate: (credentials: Credentials) => Effect.Effect<Session, InvalidCredentials>
  logout: (token: Token<Id<User>>) => Effect.Effect<void>
}

export type FirstName = typeof FirstName.Type
const FirstNameBrand: unique symbol = Symbol.for("FirstName")
export const FirstName = Schema.NonEmptyTrimmedString.pipe(Schema.maxLength(100), Schema.brand(FirstNameBrand))

export type LastName = typeof LastName.Type
const LastNameBrand: unique symbol = Symbol.for("LastName")
export const LastName = Schema.NonEmptyTrimmedString.pipe(Schema.maxLength(100), Schema.brand(LastNameBrand))

export type Picture = typeof Picture.Type
const PictureBrand: unique symbol = Symbol.for("Picture")
export const Picture = Schema.NonEmptyTrimmedString.pipe(Schema.maxLength(500), Schema.brand(PictureBrand))

export class User extends Schema.Class<User>("User")({
  email: Email,
  firstName: Schema.OptionFromSelf(FirstName),
  lastName: Schema.OptionFromSelf(LastName),
  picture: Schema.OptionFromSelf(Picture)
}) {}
