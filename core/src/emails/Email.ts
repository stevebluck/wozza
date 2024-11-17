import { Schema } from "effect"

const EmailBrand: unique symbol = Symbol.for("Email")

export type Email = typeof Email.Type
export const Email = Schema.Lowercase.pipe(
  Schema.compose(Schema.Trim),
  // Extracted from https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email#basic_validation
  Schema.pattern(
    /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  ),
  Schema.brand(EmailBrand)
)
