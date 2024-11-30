import { FetcherFormProps, useFetcher } from "react-router"

export const useForm = <A,>(name: string) => {
  const fetcher = useFetcher<A>({ key: name })

  return {
    ...fetcher,
    Form: (props: FetcherFormProps & React.RefAttributes<HTMLFormElement>) => <fetcher.Form {...props} />
  }
}
