import { Handler, HandlerMiddleware } from "@wozza/react-router-effect"
import { Logger } from "effect"

const appLayer = Logger.pretty

export const Loader = Handler.make(appLayer, {
  middleware: (handler) => HandlerMiddleware.withLogger(handler)
})
