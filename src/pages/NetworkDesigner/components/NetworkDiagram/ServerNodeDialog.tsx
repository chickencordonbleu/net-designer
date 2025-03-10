import {
  DialogHeader,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Info } from "lucide-react";
import { NetworkConnection } from "../../types/serverDesign.types";

interface ServerNodeDialogProps {
  label: string;
  networks: Array<{
    name: string;
    ports: string;
    speed: string;
  }>;
  connections: NetworkConnection[];
}

export default function ServerNodeDialog({
  connections,
  label,
  networks,
}: ServerNodeDialogProps) {
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
                  {networks.map((net, index) => (
                    <tr
                      key={index}
                      className={`hover:bg-muted/30 border-b last:border-b-0 ${getNetworkColorClasses(
                        net.name
                      )}`}
                    >
                      <td className="text-xs p-2 font-medium capitalize">
                        {net.name}
                      </td>
                      <td className="text-xs p-2 text-right">{net.ports}</td>
                      <td className="text-xs p-2 text-right">{net.speed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Port Connections Section */}
          <div>
            <h3 className="text-sm font-medium mb-3">Port Connections</h3>
            <div className="rounded-md border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
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
                  {connections.length > 0 ? (
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
                        No connections found for this server
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
