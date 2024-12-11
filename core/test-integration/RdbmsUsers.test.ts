import { Layer } from "effect"
import { RdbmsUsers } from "../src/users/RdbmsUsers.ts"
import { UsersSpec } from "../test/users/UsersSpec.ts"
import { TestContainer } from "./services/TestContainer.ts"
import { Seed } from "../test/Seed.ts"
import { Migrator } from "./services/Migrator.ts"

const layer = Seed.layer.pipe(
  Layer.provideMerge(RdbmsUsers.layer),
  Layer.provide(Migrator),
  Layer.provide(TestContainer.Database)
)

TestContainer.middleware((it) => UsersSpec.run({ layer, it }))
