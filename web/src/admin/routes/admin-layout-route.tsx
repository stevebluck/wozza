import { Outlet } from "react-router"
import { Loader } from "~/main.server"
import { Effect, Schema } from "effect"
import { User } from "@wozza/core"
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
import { AdminSidebar } from "../components/admin-sidebar"
import { Route } from "./+types/admin-layout-route"

export const loader = Effect.gen(function* () {
  const session = yield* CurrentSession
  const themes = yield* Themes

  const theme = yield* themes.get

  return Result.Json({
    user: Schema.encodeSync(User)(session.user.value),
    theme
  })
}).pipe(Sessions.authenticated, Loader.fromEffect)

export default function AdminLayout({ loaderData }: Route.ComponentProps) {
  return (
    <div className={cn(loaderData.theme, "bg-background text-foreground")}>
      <SidebarProvider>
        <AdminSidebar user={loaderData.user} />
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
              <ThemeSelector theme={loaderData.theme} />
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
    </div>
  )
}
