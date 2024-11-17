import * as Core from "@wozza/core"
import { Context, Effect, Layer } from "effect"

export class Users extends Effect.Tag("@app/Users")<Users, Core.Users>() {
  static Reference = Layer.effect(Users, Core.Reference.Users.make)
  static Rdbms = Layer.effect(Users, Core.RdbmsUsers.make)
}
