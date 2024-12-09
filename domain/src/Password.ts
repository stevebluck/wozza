import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto"
import { Brand, Effect, Schema } from "effect"

const PlainBrand: unique symbol = Symbol.for("Password/Plain")
const StrongBrand: unique symbol = Symbol.for("Password/Strong")
const HashedBrand: unique symbol = Symbol.for("Password/Hashed")

export type Plaintext = typeof Plaintext.Type
export const Plaintext = Schema.String.pipe(Schema.maxLength(100), Schema.brand(PlainBrand))

export type Strong = typeof Strong.Type
export const Strong = Schema.String.pipe(Schema.maxLength(100), Schema.brand(StrongBrand))

export type Hashed = Brand.Branded<string, typeof HashedBrand>
const Hashed = Brand.nominal<Hashed>()

export const hash =
  (saltRounds: number) =>
  (password: Strong): Effect.Effect<Hashed> => {
    return Effect.gen(function* () {
      const salt = randomBytes(16).toString("hex")
      const buf = scryptSync(password, salt, 64, { N: saltRounds })
      return Hashed(`${buf.toString("hex")}.${salt}`)
    })
  }

export const match =
  (saltRounds: number) =>
  (password: Plaintext, hashed: Hashed): Effect.Effect<boolean> =>
    Effect.gen(function* () {
      const [hashedPassword, salt] = hashed.split(".")
      const hashedPasswordBuf = Buffer.from(hashedPassword, "hex")
      const suppliedPasswordBuf = scryptSync(password, salt, 64, { N: saltRounds })

      return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf)
    })
