import { Schema } from "effect"
import { Email } from "./Email"

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
  firstName: Schema.OptionFromSelf(FirstName),
  lastName: Schema.OptionFromSelf(LastName),
  picture: Schema.OptionFromSelf(Picture)
}) {}
