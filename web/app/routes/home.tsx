import * as Route from "./+types.home"
import { isRouteErrorResponse, useRevalidator, useRouteError, type MetaFunction } from "react-router"

export const meta: MetaFunction = () => {
  return [{ title: "New React Router App" }, { name: "description", content: "Welcome to React Router!" }]
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { revalidate } = useRevalidator()

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-16">
        <header className="flex flex-col items-center gap-9">
          <h1 className="leading text-2xl font-bold text-gray-800 dark:text-gray-100">
            Welcome to <span className="sr-only">React Router</span>
          </h1>
          <button onClick={() => revalidate()} type="button">
            Revalidate
          </button>
          <pre>{JSON.stringify({ loaderData }, null, 2)}</pre>
          <div className="w-[500px] max-w-[100vw] p-4">
            <img src="/logo-light.svg" alt="React Router" className="block w-full dark:hidden" />
            <img src="/logo-dark.svg" alt="React Router" className="hidden w-full dark:block" />
          </div>
        </header>
        <nav className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-gray-200 p-6 dark:border-gray-700">
          <p className="leading-6 text-gray-700 dark:text-gray-200">What&apos;s next?</p>
        </nav>
      </div>
    </div>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()

  const isErrorResponse = isRouteErrorResponse(error)

  return <pre>{JSON.stringify({ name: "root", isErrorResponse, error }, null, 2)}</pre>
}
