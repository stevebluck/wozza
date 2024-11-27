import { Theme } from "~/themes/Themes"

export namespace DashboardPage {
  export interface Props {
    theme: Theme
  }
}

export const DashboardPage = (props: DashboardPage.Props) => {
  return (
    <div>
      <h1>Dashboard</h1>
      <div>theme: {props.theme}</div>
    </div>
  )
}
