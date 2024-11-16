import { Cookies, HttpServerRequest } from "@effect/platform"
import { ParsedSearchParams } from "@effect/platform/HttpServerRequest"
import { Data, Effect, Schema } from "effect"
import { ParseError } from "effect/ParseResult"
import { Cookie } from "./Cookie"

// TODO: create new ParseError type that mimics the O type
export const parseSearchParams = <I, O extends Record<string, string | ReadonlyArray<string> | undefined>, R>(
  schema: Schema.Schema<I, O, R>
): Effect.Effect<I, ParseError, R | ParsedSearchParams> => HttpServerRequest.schemaSearchParams(schema)

export const parseCookie = <A, R>(
  cookie: Cookie<A, R>
): Effect.Effect<A, ParseError | Cookies.CookiesError, HttpServerRequest.HttpServerRequest | R> =>
  HttpServerRequest.schemaCookies(Schema.Struct({ [cookie.settings.name]: Schema.String })).pipe(
    Effect.flatMap((obj) => Cookies.makeCookie(cookie.settings.name, obj[cookie.settings.name], cookie.settings)),
    Effect.flatMap(cookie.parse)
  )

export const parseHeaders = <I, O extends Readonly<Record<string, string | undefined>>, R>(
  schema: Schema.Schema<I, O, R>
): Effect.Effect<I, ParseError, R | HttpServerRequest.HttpServerRequest> => HttpServerRequest.schemaHeaders(schema)

export const getCookieHeader: Effect.Effect<string, CookieHeaderNotFound, HttpServerRequest.HttpServerRequest> =
  parseHeaders(Schema.Struct({ cookie: Schema.String })).pipe(
    Effect.option,
    Effect.flatten,
    Effect.map((r) => r.cookie),
    Effect.mapError(() => new CookieHeaderNotFound())
  )

export class CookieHeaderNotFound extends Data.TaggedError("CookieHeaderNotFound") {}
