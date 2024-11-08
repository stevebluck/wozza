import { Context, Effect } from "effect"

interface Sessions {}

export class CookieSessions extends Context.Tag("CookieSessions")<CookieSessions, Sessions>() {
  static make = Effect.gen(function* () {})
}
