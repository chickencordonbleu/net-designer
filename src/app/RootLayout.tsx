import * as React from "react";
import { Toaster } from "sonner";
import { AppSidebar } from "../components/app-sidebar";
import { ModeToggle } from "../components/mode-toggle";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb";
import { Separator } from "../components/ui/separator";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "../components/ui/sidebar";
import { Link, Outlet, useLocation, useParams } from "react-router-dom";
import { useNetworkProject } from "@/entities/networkProjects";

function getBreadcrumbs(pathname: string, projectName?: string) {
  const crumbs = [
    {
      label: "Network Designer Projects",
      href: "/",
    },
  ];

  if (pathname.startsWith("/projects/")) {
    crumbs.push({
      label: projectName ?? "",
      href: pathname,
    });
  }

  return crumbs;
}

export function RootLayout() {
  const location = useLocation();
  const { id } = useParams();
  const { data: project } = useNetworkProject(id);

  const breadcrumbs = getBreadcrumbs(location.pathname, project?.name);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b justify-between">
          <div className="flex items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={crumb.href}>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink
                        asChild={index < breadcrumbs.length - 1}
                        href={crumb.href}
                      >
                        {index < breadcrumbs.length - 1 ? (
                          <Link to={crumb.href}>{crumb.label}</Link>
                        ) : (
                          crumb.label
                        )}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="pr-5">
            <ModeToggle />
          </div>
        </header>
        <div className="h-[calc(100vh-4rem)]">
          <Outlet />
        </div>
      </SidebarInset>
      <Toaster position="top-right" />
    </SidebarProvider>
  );
}
