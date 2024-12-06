import { Context, Effect } from "effect"
import { Credentials, CredentialsAlreadyExist, InvalidCredentials } from "@wozza/domain"
import { Session, Token } from "@wozza/domain"
import { Id } from "@wozza/prelude"
import { User } from "@wozza/domain"

export interface Users {
  readonly _: typeof UsersSymbol
  identify: (token: Token<Id<User>>) => Effect.Effect<Session, Token.NoSuchToken>
  register: (credentials: Credentials) => Effect.Effect<Session, CredentialsAlreadyExist>
  authenticate: (credentials: Credentials) => Effect.Effect<Session, InvalidCredentials>
  logout: (token: Token<Id<User>>) => Effect.Effect<void>
}

export const UsersSymbol: unique symbol = Symbol("@core/Users")

export const Users = Context.GenericTag<Users>("@core/Users")
