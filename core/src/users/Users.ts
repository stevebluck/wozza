import { Context, Effect } from "effect"
import { CredentialsAlreadyExist, Email, InvalidCredentials, Password } from "@wozza/domain"
import { Session, Token } from "@wozza/domain"
import { Id } from "@wozza/prelude"
import { User } from "@wozza/domain"

export interface Users {
  readonly _: typeof UsersSymbol

  identify: (token: Token<Id<User>>) => Effect.Effect<Session, Token.NoSuchToken>

  register: (email: Email, password: Password.Strong) => Effect.Effect<Session, CredentialsAlreadyExist>

  // Session | RequiresMfa<userId>
  authenticate: (email: Email, password: Password.Plaintext) => Effect.Effect<Session, InvalidCredentials>
  // authenticate: (email: Email, password: Password.Plaintext) => Effect.Effect<Session, InvalidCredentials>

  // generateSocialUrl: (provider: SocialProvider) => Effect.Effect<SocialProvider.Url>

  // Credentials -> EmailPassword | OAuth.Code
  // login: (credentials: Credentials) => Effect.Effect<Session | RequiresMfa, InvalidCredentials>

  // Mfa.Code -> Otp | Totp | BackupCode
  // verifyMfaCode: (code: Mfa.Code) => Effect.Effect<Session, Mfa.InvalidCode>

  logout: (token: Token<Id<User>>) => Effect.Effect<void>

  // enable2fa: (id: Id<User>, password: Password.Plaintext) => Effect.Effect<[totpUri, backupCodes], InvalidCredentials>

  // disable2fa: (id: Id<User>, password: Password.Plaintext) => Effect.Effect<void. InvalidCredentials>

  // sendOtp: (id: Id<User>) => Effect.Effect<Mfa.Otp, User.NotFound>

  // generateBackupCodes: (id: Id<User>, password: Password.Plaintext) => Effect.Effect<Array<Mfa.BackupCode>, InvalidCredentials>

  // viewBackupCodes: (id: Id<User>) => Effect.Effect<Array<Mfa.BackupCode>>
}

export const UsersSymbol: unique symbol = Symbol("@core/Users")

export const Users = Context.GenericTag<Users>("@core/Users")
