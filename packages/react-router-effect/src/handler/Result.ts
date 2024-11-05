import { Data } from "effect"

export type Result<A, E = never> = Data.TaggedEnum<{
  Redirect: { location: string; init: RedirectInit | undefined }
  Ok: { value: A; init: ResponseInit | undefined }
  Error: { error: E; init: ResponseInit | undefined }
  Exception: { defect: unknown; init: ResponseInit | undefined }
}>

type RedirectInit = Omit<ResponseInit, "status"> & { status: 302 | 301 }

export namespace Result {
  interface RemoteDataDefinition extends Data.TaggedEnum.WithGenerics<2> {
    readonly taggedEnum: Result<this["A"], this["B"]>
  }

  const Result = Data.taggedEnum<RemoteDataDefinition>()

  export const Ok = <A>(value: A, init?: ResponseInit) => Result.Ok({ value, init })
  export const Error = <E>(error: E, init?: ResponseInit) => Result.Error({ error, init })
  export const Redirect = (location: string, init?: RedirectInit) => Result.Redirect({ location, init })
  export const Exception = (defect: unknown, init?: ResponseInit) => Result.Exception({ defect, init })

  export const match = Result.$match
}
