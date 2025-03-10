import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  FormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Network, Server } from "lucide-react";
import { OVERSUBSCRIPTION_RATIOS, PORT_SPEEDS } from "../constants/constants";
import { Separator } from "@/components/ui/separator";
import { useUpdateNetworkProject } from "@/entities/networkProjects";
import {
  NetworkProject,
  UpdateNetworkProjectType,
} from "@/entities/networkProjects/types";

interface NetworkDesignerFormProps {
  networkProject: NetworkProject;
}

export function NetworkDesignerForm({
  networkProject,
}: NetworkDesignerFormProps) {
  const updateProject = useUpdateNetworkProject();
  const form = useForm<NetworkProject>({
    defaultValues: networkProject,
  });

  const handleSubmit = (formValues: UpdateNetworkProjectType) => {
    updateProject.mutate(formValues);
    toast.success("Saved!");
  };

  return (
    <Card className="w-full col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Server className="mr-2" size={20} />
          Server Configuration
        </CardTitle>
        <CardDescription>
          Configure your server and network deployment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="servers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Servers</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator />
            <div className="flex items-center mb-4">
              <Network className="mr-2" size={16} />
              <h3 className="font-medium">Frontend Network Configuration</h3>
            </div>
            <FormField
              control={form.control}
              name="frontendNetwork.nicPorts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIC Ports per Server</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="16"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10) || 1)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="frontendNetwork.portSpeed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Port Speed</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select port speed" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PORT_SPEEDS.map((speed) => (
                        <SelectItem key={speed.value} value={speed.value}>
                          {speed.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />
            <div className="flex items-center mb-4">
              <Network className="mr-2" size={16} />
              <h3 className="font-medium">GPU Network Configuration</h3>
            </div>
            <FormField
              control={form.control}
              name="gpuNetwork.nicPorts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIC Ports per Server</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="16"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10) || 1)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gpuNetwork.portSpeed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Port Speed</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select port speed" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PORT_SPEEDS.map((speed) => (
                        <SelectItem key={speed.value} value={speed.value}>
                          {speed.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
