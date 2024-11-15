import { HttpResponseState } from "@wozza/react-router-effect"
import { Context, Effect } from "effect"
import { State } from "./RequestSessions"
import { HttpServerRequest } from "@effect/platform"

export class SessionStorage extends Context.Tag("SessionStorage")<
  SessionStorage,
  {
    createSessionsState: Effect.Effect<State<any>, never, HttpServerRequest.HttpServerRequest>
    save: (state: State<any>) => Effect.Effect<void, never, HttpResponseState.HttpResponseState>
  }
>() {}

export type Service = Context.Tag.Service<SessionStorage>
