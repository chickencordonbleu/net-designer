import * as React from "react";
import { Server, PieChart, ListCheck, Workflow } from "lucide-react";

import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "ClusterGen",
    email: "admin@clustergen.io",
    avatar: "/avatars/shadcn.jpg",
  },
  projects: [
    {
      name: "Network Designer",
      url: "",
      icon: Workflow,
      isActive: true,
    },
    {
      name: "Network Validator",
      url: "#",
      icon: ListCheck,
    },
    {
      name: "Network Optimization",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Network Inventory",
      url: "#",
      icon: Server,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
