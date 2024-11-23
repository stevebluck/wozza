import * as Core from "@wozza/core"
import { Effect, Layer, Option, Schema } from "effect"

const seed = (users: Core.Users) =>
  Effect.gen(function* () {
    yield* users.register(
      Core.Credentials.OAuth({
        email: Core.Email.make("stephen@whatthebluck.com"),
        firstName: Option.some(Core.FirstName.make("Stephen")),
        lastName: Option.some(Core.LastName.make("Wozza")),
        picture: Option.some(Core.Picture.make("/avatar.jpeg")),
        provider: "google"
      })
    )
  }).pipe(Effect.orDie)

export class Users extends Effect.Tag("@app/Users")<Users, Core.Users>() {
  static Reference = Layer.effect(Users, Core.Reference.Users.make.pipe(Effect.tap(seed)))
  static Rdbms = Layer.effect(Users, Core.RdbmsUsers.make).pipe(Layer.provide(Core.Database))
}

export class User extends Schema.Class<User>("@web/User")({
  email: Schema.String,
  name: Schema.String,
  avatar: Schema.NullOr(Schema.String)
}) {}

export const UserFromCore = Schema.transform(Core.User, User, {
  encode: (user) =>
    Core.User.make({
      email: Core.Email.make(user.email),
      firstName: Option.some(Core.FirstName.make(user.name)),
      lastName: Option.none(),
      picture: Option.fromNullable(user.avatar).pipe(Option.map(Core.Picture.make))
    }),
  decode: (user) =>
    User.make({
      email: user.email.toString(),
      name: Option.getOrElse(user.firstName, () => "Dave"),
      avatar: Option.getOrNull(user.picture)
    })
})
