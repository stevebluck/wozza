import { Schema } from "effect"

export type Theme = (typeof Theme)[keyof typeof Theme]
export const Theme = {
  Light: "light",
  Dark: "dark"
} as const

export const ThemeFromString = Schema.compose(Schema.String, Schema.Literal(...Object.values(Theme)))
