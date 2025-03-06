import { useState } from "react";
import { NetworkDesignerForm } from "./NetworkDesignerForm";
import { ServerConfig } from "./serverConfig.types";
import { YamlSnipper } from "./YamlSnipper";
import { generateNetworkDesign } from "./serverDesign.helpers";

export function NetworkDesigner() {
  const [serverConfig, setServerConfig] = useState<ServerConfig>({
    servers: 10,
    frontendNetwork: {
      networkType: "spine-leaf",
      oversubscriptionRatio: "1:1",
      nicPorts: 4,
      portSpeed: "100G",
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
    <div className="grid grid-cols-3 gap-4 h-full overflow-auto p-4">
      <NetworkDesignerForm values={serverConfig} onSubmit={setServerConfig} />
      <YamlSnipper serverConfig={serverConfig} networkDesign={networkDesign} />
    </div>
  );
}
