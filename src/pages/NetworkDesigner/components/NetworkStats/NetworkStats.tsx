import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileDigit, Server, Network, Cable, Activity } from "lucide-react";
import { NetworkDesign } from "../../types/serverDesign.types";
import { NumberStat } from "./NumberStat";
import BarStat from "./BarStat";

function getNetworkStats(networkDesign: NetworkDesign) {
  const connectionsByNetwork: Record<string, number> = {};
  const connectionsBySpeed: Record<string, number> = {};

  networkDesign.connections.forEach((conn) => {
    // Count by network
    if (!connectionsByNetwork[conn.network]) {
      connectionsByNetwork[conn.network] = 0;
    }
    connectionsByNetwork[conn.network]++;

    // Count by speed
    if (!connectionsBySpeed[conn.speed]) {
      connectionsBySpeed[conn.speed] = 0;
    }
    connectionsBySpeed[conn.speed]++;
  });

  return {
    servers: networkDesign.servers.length,
    spines: networkDesign.spineSwitches.length,
    leaves: networkDesign.leafSwitches.length,
    connections: networkDesign.connections.length,
    connectionsByNetwork,
    connectionsBySpeed,
  };
}

interface NetworkStatsProps {
  networkDesign: NetworkDesign;
}

export function NetworkStats({ networkDesign }: NetworkStatsProps) {
  const networkStats = getNetworkStats(networkDesign);

  return (
    <Card className="w-full col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex flex-col">
          <CardTitle className="flex items-center text-lg">
            <FileDigit className="mr-2" size={20} />
            Network Statistics
          </CardTitle>
          <CardDescription>
            Summary metrics for your network design
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <NumberStat
            icon={<Server className="mr-1 h-4 w-4" />}
            label="Servers"
            value={networkStats.servers}
          />
          <NumberStat
            icon={<Network className="mr-1 h-4 w-4" />}
            label="Leaf Switches"
            value={networkStats.leaves}
          />
          <NumberStat
            icon={<Network className="mr-1 h-4 w-4" />}
            label="Spine Switches"
            value={networkStats.spines}
          />
          <NumberStat
            icon={<Cable className="mr-1 h-4 w-4" />}
            label="Connections"
            value={networkStats.connections}
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <BarStat
            title="Network Distribution"
            icon={<Activity className="mr-2 h-4 w-4" />}
            items={Object.entries(networkStats.connectionsByNetwork).map(
              ([network, count]) => ({
                label: network,
                value: count,
              })
            )}
          />
          <BarStat
            title="Connections by Network"
            icon={<Activity className="mr-2 h-4 w-4" />}
            items={Object.entries(networkStats.connectionsByNetwork).map(
              ([network, count]) => ({
                label: network,
                value: count,
              })
            )}
          />
          <BarStat
            title="Connections by Speed"
            icon={<Activity className="mr-2 h-4 w-4" />}
            items={Object.entries(networkStats.connectionsBySpeed).map(
              ([speed, count]) => ({
                label: speed,
                value: count,
              })
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
