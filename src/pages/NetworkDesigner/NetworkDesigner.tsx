import { useState } from "react";
import { ServerConfig } from "./types/serverConfig.types";
import { generateNetworkDesign } from "./helpers/serverDesign.helpers";
import { NetworkDesignerForm } from "./components/NetworkDesignerForm";
import { YamlSnipper } from "./components/YamlSnipper";
import { NetworkDiagram } from "./components/NetworkDiagram/NetworkDiagram";
import { NetworkStats } from "./components/NetworkStats/NetworkStats";

export function NetworkDesigner() {
  const [serverConfig, setServerConfig] = useState<ServerConfig>({
    servers: 2,
    frontendNetwork: {
      networkType: "spine-leaf",
      oversubscriptionRatio: "1:1",
      nicPorts: 2,
      portSpeed: "40G",
    },
    gpuNetwork: {
      networkType: "spine-leaf",
      oversubscriptionRatio: "1:1",
      nicPorts: 4,
      portSpeed: "100G",
    },
  });
  const networkDesign = generateNetworkDesign(serverConfig);

  return (
    <div className="grid grid-cols-3 gap-6 h-full overflow-auto p-6">
      <NetworkDesignerForm values={serverConfig} onSubmit={setServerConfig} />
      <YamlSnipper serverConfig={serverConfig} networkDesign={networkDesign} />
      <NetworkStats networkDesign={networkDesign} />
      <NetworkDiagram networkDesign={networkDesign} />
    </div>
  );
}
