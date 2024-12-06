import { Outlet } from "react-router"
import { Loader } from "~/main.server"
import { Effect, Option } from "effect"
import { Result } from "@wozza/react-router-effect"
import { CurrentSession, Sessions } from "~/auth/Sessions"
import { Themes } from "~/themes/Themes"
import { cn } from "~/ui/classnames"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "~/ui/breadcrumb"
import { Separator } from "~/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "~/ui/sidebar"
import { ThemeSelector } from "~/themes/components/theme-selector"
import { AppSidebar } from "../components/app-sidebar"
import { Route } from "./+types/layout"

export const loader = Effect.gen(function* () {
  const session = yield* CurrentSession
  const email = session.user.value.email.toString()

  return Result.Json({
    user: {
      email,
      name: Option.getOrUndefined(session.user.value.firstName),
      avatar: Option.getOrUndefined(session.user.value.picture)
    }
  })
}).pipe(Sessions.authenticated, Loader.fromEffect)

export default function AdminLayout({ loaderData }: Route.ComponentProps) {
  return (
    <SidebarProvider>
      <AppSidebar user={loaderData.user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4 flex-1">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb className="flex-1">
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Building Your Application</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <ThemeSelector />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div>
          <div>
            <Outlet />
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
