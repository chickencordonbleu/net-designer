import { Server, Network, Cable, Plug, Leaf } from "lucide-react";
import { NetworkDesign } from "../../types/serverDesign.types";
import { NumberStat } from "./NumberStat";

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
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 col-span-5">
      <NumberStat
        icon={<Server className="mr-1 h-4 w-4" />}
        label="Servers"
        value={networkStats.servers}
      />
      <NumberStat
        icon={<Network className="mr-1 h-4 w-4" />}
        label="Spine Switches"
        value={networkStats.spines}
      />
      <NumberStat
        icon={<Leaf className="mr-1 h-4 w-4" />}
        label="Leaf Switches"
        value={networkStats.leaves}
      />
      <NumberStat
        icon={<Cable className="mr-1 h-4 w-4" />}
        label="Connections"
        value={networkStats.connections}
      />
      <NumberStat
        icon={<Plug className="mr-1 h-4 w-4" />}
        label="SFPs"
        value={(networkStats.connections ?? 0) * 2}
      />
    </div>
  );
}
