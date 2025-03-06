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
import { ServerConfig } from "./serverConfig.types";
import { Network, Server } from "lucide-react";
import {
  NETWORK_TYPES,
  OVERSUBSCRIPTION_RATIOS,
  PORT_SPEEDS,
} from "@/constants";

interface NetworkDesignerFormProps {
  values: ServerConfig;
  onSubmit: (data: ServerConfig) => void;
}

export function NetworkDesignerForm({
  values,
  onSubmit,
}: NetworkDesignerFormProps) {
  const form = useForm<ServerConfig>({
    defaultValues: values,
  });

  // Watch network type values for conditional rendering
  const frontendNetworkType = form.watch("frontendNetwork.networkType");
  const gpuNetworkType = form.watch("gpuNetwork.networkType");

  // Handle form submission
  const handleSubmit = (data: ServerConfig) => {
    onSubmit(data);
    toast.success("Network design generated!");
  };

  return (
    <Card className="w-full">
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

            {/* Frontend Network Section */}
            <div className="border p-4 rounded-md space-y-4">
              <div className="flex items-center mb-2">
                <Network className="mr-2" size={16} />
                <h3 className="font-medium">Frontend Network Configuration</h3>
              </div>

              <FormField
                control={form.control}
                name="frontendNetwork.networkType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Network Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select network type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {NETWORK_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {frontendNetworkType === "spine-leaf" && (
                <FormField
                  control={form.control}
                  name="frontendNetwork.oversubscriptionRatio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Oversubscription Ratio</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select ratio" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {OVERSUBSCRIPTION_RATIOS.map((ratio) => (
                            <SelectItem key={ratio.value} value={ratio.value}>
                              {ratio.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

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
            </div>

            {/* GPU Network Section */}
            <div className="border p-4 rounded-md space-y-4">
              <div className="flex items-center mb-2">
                <Network className="mr-2" size={16} />
                <h3 className="font-medium">GPU Network Configuration</h3>
              </div>

              <FormField
                control={form.control}
                name="gpuNetwork.networkType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Network Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select network type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {NETWORK_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {gpuNetworkType === "spine-leaf" && (
                <FormField
                  control={form.control}
                  name="gpuNetwork.oversubscriptionRatio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Oversubscription Ratio</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select ratio" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {OVERSUBSCRIPTION_RATIOS.map((ratio) => (
                            <SelectItem key={ratio.value} value={ratio.value}>
                              {ratio.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

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
            </div>

            <Button type="submit" className="w-full">
              Generate Network Design
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
