import { reactRouter } from "@react-router/dev/vite"
import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig, Plugin } from "vite"

export default defineConfig({
  build: { target: "esnext" },
  optimizeDeps: { holdUntilCrawlEnd: true },
  plugins: [reactRouter(), tsconfigPaths()]
})
