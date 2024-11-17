import { Cookies, HttpServerRequest } from "@effect/platform"
import { Data, Effect, Schema } from "effect"
import { ParseError } from "effect/ParseResult"
import { Cookie } from "./Cookie"

// TODO: create new ParseError type that mimics the O type
export const parseSearchParams = HttpServerRequest.schemaSearchParams

// move to Cookies
export const parseCookie = <A, R>(
  cookie: Cookie<A, R>
): Effect.Effect<A, ParseError | Cookies.CookiesError, HttpServerRequest.HttpServerRequest | R> =>
  HttpServerRequest.schemaCookies(Schema.Struct({ [cookie.settings.name]: Schema.String })).pipe(
    Effect.flatMap((obj) => Cookies.makeCookie(cookie.settings.name, obj[cookie.settings.name], cookie.settings)),
    Effect.flatMap(cookie.parse)
  )

export const parseHeaders = HttpServerRequest.schemaHeaders

export const parseForm = HttpServerRequest.schemaBodyForm

// move to ReqyestSession middleware
export const getCookieHeader: Effect.Effect<string, CookieHeaderNotFound, HttpServerRequest.HttpServerRequest> =
  parseHeaders(Schema.Struct({ cookie: Schema.String })).pipe(
    Effect.option,
    Effect.flatten,
    Effect.map((r) => r.cookie),
    Effect.mapError(() => new CookieHeaderNotFound())
  )

export class CookieHeaderNotFound extends Data.TaggedError("CookieHeaderNotFound") {}
