import { UsersSpec } from "./UsersSpec.ts"
import { ReferenceUsers } from "../../src/users/ReferenceUsers.ts"
import { Layer } from "effect"
import { it } from "@effect/vitest"
import { Seed } from "../Seed.ts"

const layer = Seed.layer.pipe(Layer.provideMerge(ReferenceUsers.layer))

UsersSpec.run({ layer, it })
