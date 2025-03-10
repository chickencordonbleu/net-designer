import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RootLayout } from "../RootLayout";
import { NetworkDesigner } from "@/pages/NetworkDesigner/NetworkDesigner";
import { NetworkDesignerProjects } from "@/pages/NetworkDesignerProjects/NetworkDesignerProjects";

export function RoutesProvider() {
  return (
    <RouterProvider
      router={createBrowserRouter([
        {
          path: "/",
          Component: RootLayout,
          children: [
            {
              index: true,
              Component: NetworkDesignerProjects,
            },
            {
              path: "projects/:id",
              Component: NetworkDesigner,
            },
          ],
        },
      ])}
    />
  );
}
