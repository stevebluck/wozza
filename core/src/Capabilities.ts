import { Data } from "effect"
import { Users } from "./users/Users"

export interface Capabilities {
  users: Users
}

export const Capabilities = Data.case<Capabilities>()
