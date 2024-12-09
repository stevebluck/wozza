import { Data } from "effect"

export class InvalidCredentials extends Data.TaggedError("InvalidCredentials") {}

export class CredentialsAlreadyExist extends Data.TaggedError("CredentialsAlreadyExist") {}
