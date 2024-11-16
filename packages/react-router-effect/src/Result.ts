import { Data } from "effect"

type ResponseInit = Omit<globalThis.ResponseInit, "status"> & { status: number }
type RedirectInit = Omit<ResponseInit, "status"> & { status: 302 | 301 }

export type Result<A> = Data.TaggedEnum<{
  Redirect: { location: string; init: RedirectInit }
  Json: { value: A; init: ResponseInit }
  Exception: { error: unknown; init: ResponseInit }
}>

interface ResultDefinition extends Data.TaggedEnum.WithGenerics<1> {
  readonly taggedEnum: Result<this["A"]>
}

const Result = Data.taggedEnum<ResultDefinition>()

export const Json = <A>(value: A, init?: ResponseInit) =>
  Result.Json({ value, init: { ...init, status: init?.status || 200 } })

export const Redirect = (location: string, init?: RedirectInit) =>
  Result.Redirect({ location, init: { ...init, status: init?.status || 302 } })

export const Exception = (error: unknown, init?: ResponseInit) =>
  Result.Exception({ error, init: { ...init, status: init?.status || 500 } })

export const match = Result.$match
