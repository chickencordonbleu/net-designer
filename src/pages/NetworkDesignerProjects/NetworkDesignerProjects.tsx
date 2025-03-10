import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNetworkProjects } from "@/entities/networkProjects";
import dayjs from "dayjs";
import { NewProjectForm } from "./NewProjectForm";
import { DeleteProject } from "./DeleteProject";
import { Spinner } from "@/components/ui/spinner";

export function NetworkDesignerProjects() {
  const { data: projects = [], isLoading } = useNetworkProjects();

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner />
      </div>
    );

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Network Designer Projects</CardTitle>
            <CardDescription>
              Manage your network design projects
            </CardDescription>
          </div>
          <NewProjectForm />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Servers</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <Link
                      to={`/projects/${project.id}`}
                      className="font-medium hover:underline"
                    >
                      {project.name}
                    </Link>
                  </TableCell>
                  <TableCell>{project.servers}</TableCell>
                  <TableCell>
                    {dayjs(project.createdAt).format("MMM d, YYYY")}
                  </TableCell>
                  <TableCell>
                    {dayjs(project.updatedAt).format("MMM d, YYYY")}
                  </TableCell>
                  <TableCell>
                    <DeleteProject projectId={project.id} />
                  </TableCell>
                </TableRow>
              ))}
              {projects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No projects found. Create your first project to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
