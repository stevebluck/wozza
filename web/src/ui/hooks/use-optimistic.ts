import { Array, Option } from "effect"
import { useFetchers } from "react-router"

export const useOptimistic = (name: string): Option.Option<FormData> => {
  const fetchers = useFetchers()

  return Array.findFirst(fetchers, (fetcher) => fetcher.key === name).pipe(
    Option.flatMapNullable((fetcher) => fetcher.formData)
  )
}
