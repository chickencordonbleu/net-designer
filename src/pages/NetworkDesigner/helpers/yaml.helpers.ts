import { ServerConfig } from "../types/serverConfig.types";
import { NetworkDesign, CISCO_SWITCH } from "../types/serverDesign.types";

export const generateYamlConfig = (
  serverConfig: ServerConfig,
  design: NetworkDesign
): string => {
  // Start with server configuration
  let yaml = "servers:\n";
  yaml += `  quantity: ${serverConfig.servers}\n`;
  yaml += "  networks:\n";

  // Add frontend network
  yaml += `    - name: "frontend"\n`;
  yaml += `      type: "${serverConfig.frontendNetwork.networkType}"\n`;
  if (serverConfig.frontendNetwork.networkType === "spine-leaf") {
    yaml += `      oversubscription_ratio: "${serverConfig.frontendNetwork.oversubscriptionRatio}"\n`;
  }
  yaml += `      nic-ports:\n`;
  yaml += `        quantity: ${serverConfig.frontendNetwork.nicPorts}\n`;
  yaml += `        speed: "${serverConfig.frontendNetwork.portSpeed}"\n`;

  // Add GPU network
  yaml += `    - name: "gpu"\n`;
  yaml += `      type: "${serverConfig.gpuNetwork.networkType}"\n`;
  if (serverConfig.gpuNetwork.networkType === "spine-leaf") {
    yaml += `      oversubscription_ratio: "${serverConfig.gpuNetwork.oversubscriptionRatio}"\n`;
  }
  yaml += `      nic-ports:\n`;
  yaml += `        quantity: ${serverConfig.gpuNetwork.nicPorts}\n`;
  yaml += `        speed: "${serverConfig.gpuNetwork.portSpeed}"\n`;

  // Add Cisco switch information
  yaml += "\ncisco-switches:\n";
  yaml += `  - name: "${CISCO_SWITCH.name}"\n`;
  yaml += "    networks:\n";

  CISCO_SWITCH.networks.forEach((network) => {
    yaml += `      - type: "${network.type}"\n`;
    yaml += "        switch-ports:\n";
    network.switchPorts.forEach((port) => {
      yaml += `          - quantity: ${port.quantity}\n`;
      yaml += `            speed: "${port.speed}"\n`;
    });
  });

  // Only add network design if provided
  if (design) {
    yaml += "\nnetwork-design:\n";

    // Add leaf switches
    if (design.leafSwitches.length > 0) {
      yaml += "  leaf-switches:\n";
      design.leafSwitches.forEach((leaf) => {
        yaml += `    - id: ${leaf.id}\n`;
        yaml += `      model: "${CISCO_SWITCH.name}"\n`;
        yaml += `      network: ${leaf.network}\n`;

        if (leaf.downlinks && leaf.uplinks) {
          yaml += `      downlinks: ${leaf.downlinks.length} x ${leaf.downlinks[0].speed}\n`;
          yaml += `      uplinks: ${leaf.uplinks.length} x ${leaf.uplinks[0].speed}\n`;
        } else if (leaf.ports) {
          yaml += `      ports: ${leaf.ports.length} x ${leaf.ports[0].speed}\n`;
        }
      });
    }

    // Add spine switches
    if (design.spineSwitches.length > 0) {
      yaml += "  spine-switches:\n";
      design.spineSwitches.forEach((spine) => {
        yaml += `    - id: ${spine.id}\n`;
        yaml += `      model: "${CISCO_SWITCH.name}"\n`;
        yaml += `      network: ${spine.network}\n`;
        yaml += `      downlinks: ${spine.downlinks.length} x ${spine.downlinks[0].speed}\n`;
      });
    }

    // Add connection summary
    if (design.connections.length > 0) {
      yaml += "\n  connections:\n";
      yaml += `    total: ${design.connections.length}\n`;

      // Group by network
      const networkConnections: Record<string, number> = {};
      design.connections.forEach((conn) => {
        if (!networkConnections[conn.network]) {
          networkConnections[conn.network] = 0;
        }
        networkConnections[conn.network]++;
      });

      Object.keys(networkConnections).forEach((network) => {
        yaml += `    ${network}: ${networkConnections[network]}\n`;
      });
    }
  }

  return yaml;
};
