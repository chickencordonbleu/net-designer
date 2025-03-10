import {
  DialogHeader,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Info } from "lucide-react";
import { NetworkConnection } from "../../types/serverDesign.types";

interface LeafNodeDialogProps {
  label: string;
  downlinks?: string;
  uplinks?: string;
  ports?: string;
  network?: string;
  connections: NetworkConnection[];
}

export default function LeafNodeDialog({
  connections,
  label,
  downlinks,
  uplinks,
  ports,
  network,
}: LeafNodeDialogProps) {
  // Helper function to get color classes based on network type
  const getNetworkColorClasses = (networkName: string) => {
    const name = networkName.toLowerCase();
    if (name === "frontend") {
      return "bg-green-50 dark:bg-green-950/30";
    } else if (name === "gpu") {
      return "bg-pink-50 dark:bg-pink-950/30";
    } else if (name === "storage") {
      return "bg-blue-50 dark:bg-blue-950/30";
    }
    return "";
  };

  // Get connection color classes
  const getConnectionColorClasses = (network: string) => {
    if (!network) return "";

    if (network === "frontend") {
      return "text-green-700 dark:text-green-400";
    } else if (network === "gpu") {
      return "text-pink-700 dark:text-pink-400";
    } else if (network === "storage") {
      return "text-blue-700 dark:text-blue-400";
    }
    return "";
  };

  // Create interfaces array from leaf switch properties
  const interfaces = [];

  if (uplinks) {
    const [count, speed] = uplinks.split(" x ");
    interfaces.push({
      name: "Uplinks",
      ports: count,
      speed: speed,
    });
  }

  if (downlinks) {
    const [count, speed] = downlinks.split(" x ");
    interfaces.push({
      name: "Downlinks",
      ports: count,
      speed: speed,
    });
  }

  if (ports) {
    const [count, speed] = ports.split(" x ");
    interfaces.push({
      name: "Ports",
      ports: count,
      speed: speed,
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <Info className="h-4 w-4 text-foreground" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
        </DialogHeader>

        <div className="py-2 space-y-6">
          {/* Basic Info Section */}
          {network && (
            <div>
              <h3 className="text-sm font-medium mb-2">Basic Information</h3>
              <div
                className={`p-3 rounded-md border ${getNetworkColorClasses(
                  network
                )}`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span>Network</span>
                  <span
                    className={`font-medium ${getConnectionColorClasses(
                      network
                    )}`}
                  >
                    {network.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Network Interfaces Section */}
          <div>
            <h3 className="text-sm font-medium mb-3">Network Interfaces</h3>
            <div className="rounded-md border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-xs font-medium text-left p-2 border-b">
                      Interface
                    </th>
                    <th className="text-xs font-medium text-right p-2 border-b">
                      Ports
                    </th>
                    <th className="text-xs font-medium text-right p-2 border-b">
                      Speed
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {interfaces.map((intf, index) => (
                    <tr
                      key={index}
                      className={`hover:bg-muted/30 border-b last:border-b-0 ${
                        network ? getNetworkColorClasses(network) : ""
                      }`}
                    >
                      <td className="text-xs p-2 font-medium capitalize">
                        {intf.name}
                      </td>
                      <td className="text-xs p-2 text-right">{intf.ports}</td>
                      <td className="text-xs p-2 text-right">{intf.speed}</td>
                    </tr>
                  ))}
                  {interfaces.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center text-xs text-muted-foreground p-4"
                      >
                        No interface information available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Port Connections Section */}
          <div>
            <h3 className="text-sm font-medium mb-3">
              Port Connections{" "}
              {connections?.length > 0 ? `(${connections.length})` : ""}
            </h3>
            <div className="rounded-md border overflow-hidden">
              <div className="max-h-[250px] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-card">
                      <th className="text-xs font-medium text-left p-2 border-b">
                        From
                      </th>
                      <th className="text-xs font-medium text-left p-2 border-b">
                        To
                      </th>
                      <th className="text-xs font-medium text-right p-2 border-b">
                        Network
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {connections && connections.length > 0 ? (
                      connections.map((conn, index) => (
                        <tr
                          key={index}
                          className="hover:bg-muted/30 border-b last:border-b-0"
                        >
                          <td className="text-xs p-2">
                            <div className="font-medium truncate max-w-[100px]">
                              {conn.source}
                            </div>
                            <div className="text-muted-foreground mt-0.5">
                              {conn.sourcePort || "Port N/A"}
                            </div>
                          </td>
                          <td className="text-xs p-2">
                            <div className="font-medium truncate max-w-[100px]">
                              {conn.target}
                            </div>
                            <div className="text-muted-foreground mt-0.5">
                              {conn.targetPort || "Port N/A"}
                            </div>
                          </td>
                          <td className="text-xs p-2 text-right">
                            <div
                              className={`font-medium ${getConnectionColorClasses(
                                conn.network
                              )}`}
                            >
                              {conn.network
                                ? conn.network.toUpperCase()
                                : "DEFAULT"}
                            </div>
                            <div className="font-mono text-muted-foreground text-[10px] mt-0.5">
                              {conn.speed}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="text-center text-xs text-muted-foreground p-4"
                        >
                          No connections found for this leaf switch
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
