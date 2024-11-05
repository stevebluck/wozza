import { HttpServerRequest } from "@effect/platform"
import { ParsedSearchParams } from "@effect/platform/HttpServerRequest"
import { Effect, Schema } from "effect"
import { ParseError } from "effect/ParseResult"

// TODO: create new ParseError type that mimics the O type
export const parseSearchParams = <I, O extends Record<string, string | ReadonlyArray<string> | undefined>, R>(
  schema: Schema.Schema<I, O, R>
): Effect.Effect<I, ParseError, R | ParsedSearchParams> => HttpServerRequest.schemaSearchParams(schema)
