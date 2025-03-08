import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDeleteNetworkProject } from "@/entities/networkProjects";
import { Trash } from "lucide-react";
import { toast } from "sonner";

interface DeleteProjectProps {
  projectId: string;
}

export function DeleteProject({ projectId }: DeleteProjectProps) {
  const deleteProject = useDeleteNetworkProject();

  const handleSubmit = async () => {
    await deleteProject.mutateAsync(projectId);
    toast.success("Project deleted!");
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Button size="sm">
          <Trash />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Delete Network Project</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this project?
          </DialogDescription>
        </DialogHeader>
        <Button type="submit" className="w-full" onClick={handleSubmit}>
          Delete Project
        </Button>
      </DialogContent>
    </Dialog>
  );
}
