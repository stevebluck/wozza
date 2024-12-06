import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
  useRouteLoaderData
} from "react-router"
import type { LinksFunction } from "react-router"

import "./app.css"
import { Effect } from "effect"
import { Themes } from "./themes/Themes"
import { Result } from "@wozza/react-router-effect"
import { Loader } from "./main.server"
import { Route } from "./+types/root"
import { cn } from "./ui/classnames"

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous"
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
  }
]

export const loader = Effect.gen(function* () {
  const themes = yield* Themes
  const theme = yield* themes.get

  return Result.Json({ theme })
}).pipe(Loader.fromEffect)

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const data = useRouteLoaderData<typeof loader>("root")

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className={cn("min-h-screen bg-background text-foreground", data?.theme)}>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App(props: Route.ComponentProps) {
  return <Outlet />
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error)) {
    return (
      <>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </>
    )
  } else if (error instanceof Error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    )
  } else {
    return <h1>Unknown Error</h1>
  }
}

export const useRootLoaderData = () => {
  return useRouteLoaderData<typeof loader>("root")
}
