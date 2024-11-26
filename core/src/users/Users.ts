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

const FirstNameSymbol: unique symbol = Symbol.for("FirstName")
export type FirstName = typeof FirstName.Type
export const FirstName = Schema.NonEmptyTrimmedString.pipe(Schema.maxLength(100), Schema.brand(FirstNameSymbol))

const LastNameSymbol: unique symbol = Symbol.for("LastName")
export type LastName = typeof LastName.Type
export const LastName = Schema.NonEmptyTrimmedString.pipe(Schema.maxLength(100), Schema.brand(LastNameSymbol))

const PictureSymbol: unique symbol = Symbol.for("Picture")
export type Picture = typeof Picture.Type
export const Picture = Schema.NonEmptyTrimmedString.pipe(Schema.maxLength(500), Schema.brand(PictureSymbol))

export class User extends Schema.Class<User>("User")({
  email: Email,
  firstName: Schema.OptionFromNullOr(FirstName),
  lastName: Schema.OptionFromNullOr(LastName),
  picture: Schema.OptionFromNullOr(Picture)
}) {}

export namespace User {
  export type Encoded = typeof User.Encoded
}
