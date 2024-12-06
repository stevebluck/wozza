import { Credentials, Email } from "@wozza/domain"
import { Option } from "effect"

export const credentialFromEmail = (email: Email) =>
  Credentials.OAuth({
    provider: "google",
    email,
    firstName: Option.none(),
    lastName: Option.none(),
    picture: Option.none()
  })
