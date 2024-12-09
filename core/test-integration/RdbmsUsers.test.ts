import { Layer } from "effect"
import { RdbmsUsers } from "../src/users/RdbmsUsers.ts"
import { UsersSpec } from "../test/users/UsersSpec.ts"
import { IntegrationSeeder } from "./IntegrationSeeder.ts"

const layer = IntegrationSeeder.pipe(Layer.merge(RdbmsUsers.layer), Layer.orDie)

UsersSpec.run(layer)
