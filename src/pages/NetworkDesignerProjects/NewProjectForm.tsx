import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCreateNetworkProject } from "@/entities/networkProjects";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function NewProjectForm() {
  const navigate = useNavigate();
  const createProject = useCreateNetworkProject();
  const form = useForm<{ name: string }>({
    defaultValues: { name: "" },
  });

  const handleSubmit = async (data: { name: string }) => {
    const newProject = await createProject.mutateAsync(data);
    toast.success("Project created!");
    navigate(`/projects/${newProject.id}`);
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>New Network Project</DialogTitle>
          <DialogDescription>
            Create a new network project to get started
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Project Name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Create New Project
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
