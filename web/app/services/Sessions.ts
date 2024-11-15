import { CookieSessionStorage, RequestSessions } from "@wozza/react-router-effect"
import { Context, Schema } from "effect"

export class Session extends Schema.Class<Session>("Session")({
  name: Schema.String
}) {}

export class Sessions extends Context.Tag("@app/Sessions")<Sessions, RequestSessions.RequestSessions<Session>>() {}

export const SessionStorageLive = CookieSessionStorage.layer("_sessions", Session)
