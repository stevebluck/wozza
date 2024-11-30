import { useForm } from "~/ui/hooks/use-form"
import { Button } from "~/ui/button"
import { MoonIcon, SunIcon } from "lucide-react"
import { Theme, ThemeFromString } from "../Theme"
import { useOptimistic } from "~/ui/hooks/use-optimistic"
import { Option, Schema } from "effect"

const FORM_NAME = "theme"
const THEME_SELECT_NAME = "theme"

export const ThemeSelector = ({ theme: initialTheme }: { theme: Theme }) => {
  const fetcher = useForm(FORM_NAME)
  const { match } = useTheme(initialTheme)

  return (
    <fetcher.Form method="POST" action="/set-theme" onChange={(e) => fetcher.submit(e.currentTarget)}>
      {match({
        [Theme.Dark]: (
          <Button name={THEME_SELECT_NAME} value={Theme.Light} variant="ghost" size="icon" type="submit">
            <SunIcon className="w-6 h-6" />
          </Button>
        ),
        [Theme.Light]: (
          <Button name={THEME_SELECT_NAME} value={Theme.Dark} variant="ghost" size="icon" type="submit">
            <MoonIcon className="w-6 h-6" />
          </Button>
        )
      })}
    </fetcher.Form>
  )
}

export const useTheme = (initialTheme: Theme) => {
  const formData = useOptimistic(FORM_NAME)

  const theme = formData.pipe(
    Option.map((formData) => formData.get(THEME_SELECT_NAME)),
    Option.flatMap(Schema.decodeUnknownOption(ThemeFromString)),
    Option.getOrElse(() => initialTheme)
  )

  return {
    theme,
    match: (obj: { [key in Theme]: React.ReactNode }) => obj[theme]
  }
}
