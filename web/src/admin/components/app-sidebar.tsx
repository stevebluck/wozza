import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal
} from "lucide-react"

import { NavMain } from "./nav-main"
import { NavProjects } from "./nav-projects"
import { NavUser } from "../../users/components/nav-user"
import { TeamSwitcher } from "./team-switcher"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "~/ui/sidebar"
import { User } from "@wozza/core"

// This is sample data.
const data = {
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise"
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup"
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free"
    }
  ],
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
          isActive: false
        },
        {
          title: "Starred",
          url: "#",
          isActive: false
        },
        {
          title: "Settings",
          url: "#",
          isActive: false
        }
      ]
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      isActive: false,
      items: [
        {
          title: "Genesis",
          url: "#",
          isActive: false
        },
        {
          title: "Explorer",
          url: "#",
          isActive: false
        },
        {
          title: "Quantum",
          url: "#",
          isActive: false
        }
      ]
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      isActive: false,
      items: [
        {
          title: "Introduction",
          url: "#",
          isActive: false
        },
        {
          title: "Get Started",
          url: "#",
          isActive: false
        },
        {
          title: "Tutorials",
          url: "#",
          isActive: false
        },
        {
          title: "Changelog",
          url: "#",
          isActive: false
        }
      ]
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      isActive: false,
      items: [
        {
          title: "General",
          url: "#",
          isActive: false
        },
        {
          title: "Team",
          url: "#",
          isActive: false
        },
        {
          title: "Billing",
          url: "#",
          isActive: false
        },
        {
          title: "Limits",
          url: "#",
          isActive: false
        }
      ]
    }
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart
    },
    {
      name: "Travel",
      url: "#",
      icon: Map
    }
  ]
}

export function AppSidebar({ user, ...props }: React.ComponentProps<typeof Sidebar> & { user: User.Encoded }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
