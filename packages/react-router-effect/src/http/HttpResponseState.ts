import { Cookies, Headers } from "@effect/platform"
import { Context, Effect, Ref } from "effect"

class State {
  static empty = new State(Cookies.empty, Headers.empty, 200)

  constructor(
    public readonly cookies: Cookies.Cookies,
    public readonly headers: Headers.Headers,
    public readonly status: number
  ) {}

  setCookie = (cookie: Cookies.Cookie): State => {
    const cookies = Cookies.setCookie(cookie)(this.cookies)

    return new State(cookies, this.headers, this.status)
  }

  setHeader = (name: string, value: string): State => {
    return new State(this.cookies, Headers.set(name, value)(this.headers), this.status)
  }

  setStatus = (status: number): State => {
    return new State(this.cookies, this.headers, status)
  }

  get init(): { headers: Headers.Headers; status: number } {
    return {
      headers: Cookies.isEmpty(this.cookies)
        ? this.headers
        : Headers.merge(this.headers)(Headers.fromInput({ "set-cookie": Cookies.toSetCookieHeaders(this.cookies) })),
      status: this.status
    }
  }
}

export class HttpResponseState extends Context.Tag("HandlerState")<HttpResponseState, Ref.Ref<State>>() {
  static make: Effect.Effect<Ref.Ref<State>> = Ref.make<State>(State.empty)
}
