import * as Core from "@wozza/core"
import { Effect, Layer, Option } from "effect"

export class Users extends Effect.Tag("@app/Users")<Users, Core.Users>() {
  static Reference = Layer.unwrapEffect(
    Effect.gen(function* () {
      const users = yield* Core.Reference.Users.make

      const credentials = Core.Credentials.OAuth({
        email: Core.Email.make("stephen@whatthebluck.com"),
        firstName: Option.some(Core.FirstName.make("Stephen")),
        lastName: Option.some(Core.LastName.make("Bluck")),
        picture: Option.some(Core.Picture.make("/avatar.jpeg")),
        provider: "google"
      })

      yield* users.register(credentials).pipe(Effect.orDie)

      return Layer.succeed(Users, users)
    })
  )

  static Rdbms = Layer.effect(Users, Core.RdbmsUsers.make).pipe(Layer.provide(Core.Database))
}

export const credentialFromEmail = (email: Core.Email) =>
  Core.Credentials.OAuth({
    provider: "google",
    email,
    firstName: Option.none(),
    lastName: Option.none(),
    picture: Option.none()
  })
