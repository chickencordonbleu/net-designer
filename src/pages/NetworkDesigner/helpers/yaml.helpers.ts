import { NetworkProject } from "@/entities/networkProjects";
import { NetworkDesign, CISCO_SWITCH } from "../types/serverDesign.types";

export const generateYamlConfig = (
  networkProject: NetworkProject,
  design: NetworkDesign
): string => {
  // Start with server configuration
  let yaml = "servers:\n";
  yaml += `  quantity: ${networkProject.servers}\n`;
  yaml += "  networks:\n";

  // Add frontend network
  yaml += `    - name: "frontend"\n`;
  yaml += `      type: "${networkProject.frontendNetwork.networkType}"\n`;
  if (networkProject.frontendNetwork.networkType === "spine-leaf") {
    yaml += `      oversubscription_ratio: "${networkProject.frontendNetwork.oversubscriptionRatio}"\n`;
  }
  yaml += `      nic-ports:\n`;
  yaml += `        quantity: ${networkProject.frontendNetwork.nicPorts}\n`;
  yaml += `        speed: "${networkProject.frontendNetwork.portSpeed}"\n`;

  // Add GPU network
  yaml += `    - name: "gpu"\n`;
  yaml += `      type: "${networkProject.gpuNetwork.networkType}"\n`;
  if (networkProject.gpuNetwork.networkType === "spine-leaf") {
    yaml += `      oversubscription_ratio: "${networkProject.gpuNetwork.oversubscriptionRatio}"\n`;
  }
  yaml += `      nic-ports:\n`;
  yaml += `        quantity: ${networkProject.gpuNetwork.nicPorts}\n`;
  yaml += `        speed: "${networkProject.gpuNetwork.portSpeed}"\n`;

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
