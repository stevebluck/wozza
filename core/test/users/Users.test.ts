import { UsersSpec } from "./UsersSpec.ts"
import { ReferenceSeeder } from "../Seeder.ts"
import { ReferenceUsers } from "../../src/users/ReferenceUsers.ts"
import { Layer } from "effect"

const layer = ReferenceSeeder.pipe(Layer.merge(ReferenceUsers.layer))

UsersSpec.run(layer)
