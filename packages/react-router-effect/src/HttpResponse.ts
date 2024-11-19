import { Cookies, Headers } from "@effect/platform"
import { Context, Effect, Ref } from "effect"
import { Cookie } from "./Cookie"

class State {
  static make = Effect.gen(function* () {
    const cookies = yield* Ref.make<Cookies.Cookies>(Cookies.empty)
    const headers = yield* Ref.make<Headers.Headers>(Headers.empty)
    const status = yield* Ref.make<number>(200)
    return new State(cookies, headers, status)
  })

  constructor(
    public readonly cookies: Ref.Ref<Cookies.Cookies>,
    public readonly headers: Ref.Ref<Headers.Headers>,
    public readonly status: Ref.Ref<number>
  ) {}

  setCookie = <A, R>(cookie: Cookie<A, R>, value: A): Effect.Effect<void, never, R> => {
    return cookie.serialize(value).pipe(
      Effect.map(Cookies.fromSetCookie),
      Effect.flatMap(Cookies.get(cookie.settings.name)),
      Effect.tap((cookie) => Ref.update(this.cookies, Cookies.setCookie(cookie))),
      Effect.ignoreLogged
    )
  }

  unsetCookie = <A, R>(cookie: Cookie<A, R>): Effect.Effect<void, never, R> => {
    return cookie.unset.pipe(
      Effect.map(Cookies.fromSetCookie),
      Effect.flatMap(Cookies.get(cookie.settings.name)),
      Effect.tap((updated) => Ref.update(this.cookies, Cookies.setCookie(updated))),
      Effect.ignoreLogged
    )
  }

  setHeader = (name: string, value: string): Effect.Effect<void> => {
    return Ref.update(this.headers, Headers.set(name, value))
  }

  setStatus = (status: number): Effect.Effect<void> => {
    return Ref.set(this.status, status)
  }

  get init(): Effect.Effect<{ headers: Headers.Headers; status: number }> {
    return Effect.all({
      headers: this.headers.get,
      cookies: this.cookies.get,
      status: this.status.get
    }).pipe(
      Effect.map(({ headers, cookies, status }) => {
        const setCookie = Headers.fromInput({ "set-cookie": Cookies.toSetCookieHeaders(cookies) })
        return {
          headers: Cookies.isEmpty(cookies) ? headers : Headers.merge(headers, setCookie),
          status
        }
      })
    )
  }
}

export class HttpResponse extends Context.Tag("HttpResponse")<HttpResponse, State>() {
  static make: Effect.Effect<State> = State.make
}
