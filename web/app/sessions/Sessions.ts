import { Context, Schema } from "effect"
import { RequestSession, SessionState } from "./RequestSession"

export interface Session {
  token: string
  theme: "light" | "dark"
}

export const SessionSchema: Schema.Schema<Session> = Schema.Struct({
  token: Schema.String,
  theme: Schema.Literal("light", "dark")
})

export class Sessions extends Context.Tag("Sessions")<Sessions, RequestSession<any>>() {
  static make = <T>(state: SessionState<T>) => RequestSession.make<T>(state)
}
