import { Effect, Option } from "effect"
import { Users } from "./Users"
import { Credentials, Email, FirstName, LastName, Picture } from "@wozza/domain"

export const seed = Effect.gen(function* () {
  const users = yield* Users

  const credentials = Credentials.OAuth({
    email: Email.make("stephen@whatthebluck.com"),
    firstName: Option.some(FirstName.make("Stephen")),
    lastName: Option.some(LastName.make("Bluck")),
    picture: Option.some(Picture.make("/avatar.jpeg")),
    provider: "google"
  })

  yield* users.register(credentials)
})
