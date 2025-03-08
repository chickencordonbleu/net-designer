import { ServerConfig } from "@/entities/networkProjects";
import { NetworkDesign, CISCO_SWITCH } from "../types/serverDesign.types";

export const generateNetworkDesign = (
  serverConfig: ServerConfig
): NetworkDesign => {
  const design: NetworkDesign = {
    servers: [],
    leafSwitches: [],
    spineSwitches: [],
    connections: [],
  };

  // Transform form data to networks array for easier processing
  const networks = [
    {
      name: "frontend",
      type: serverConfig.frontendNetwork.networkType,
      oversubscription_ratio:
        serverConfig.frontendNetwork.oversubscriptionRatio,
      nicPorts: {
        quantity: serverConfig.frontendNetwork.nicPorts,
        speed: serverConfig.frontendNetwork.portSpeed,
      },
    },
    {
      name: "gpu",
      type: serverConfig.gpuNetwork.networkType,
      oversubscription_ratio: serverConfig.gpuNetwork.oversubscriptionRatio,
      nicPorts: {
        quantity: serverConfig.gpuNetwork.nicPorts,
        speed: serverConfig.gpuNetwork.portSpeed,
      },
    },
  ];

  // Create servers
  for (let i = 0; i < serverConfig.servers; i++) {
    design.servers.push({
      id: `server-${i + 1}`,
      networks: networks.map((network) => ({
        name: network.name,
        ports: Array(network.nicPorts.quantity)
          .fill(null)
          .map((_, j) => ({
            id: `${network.name}-port-${j + 1}`,
            speed: network.nicPorts.speed,
          })),
      })),
    });
  }

  networks.forEach((network) => {
    const totalPortsPerSwitch =
      CISCO_SWITCH.networks[0].switchPorts[0].quantity;
    const totalServerConnections =
      serverConfig.servers * network.nicPorts.quantity;

    // Ensure minimum 2 leaf switches for redundancy
    const maxDownlinksPerLeaf = Math.floor(totalPortsPerSwitch / 2);
    const maxUplinksPerLeaf = totalPortsPerSwitch - maxDownlinksPerLeaf;

    // Calculate minimum leaf switches needed for redundancy and capacity
    const leafsNeededForCapacity = Math.ceil(
      totalServerConnections / maxDownlinksPerLeaf
    );
    const numLeafSwitches = Math.max(2, leafsNeededForCapacity);

    // Recalculate downlinks per leaf with minimum leaf count
    const finalDownlinksPerLeaf = Math.min(
      maxDownlinksPerLeaf,
      Math.ceil(totalServerConnections / numLeafSwitches)
    );

    // Calculate spine switches needed
    const totalUplinksNeeded = numLeafSwitches * maxUplinksPerLeaf;
    const spinesNeededForCapacity = Math.ceil(
      totalUplinksNeeded / totalPortsPerSwitch
    );
    const finalSpineCount = Math.max(2, spinesNeededForCapacity);

    // Create leaf switches
    for (let i = 0; i < numLeafSwitches; i++) {
      design.leafSwitches.push({
        id: `${network.name}-leaf-${i + 1}`,
        network: network.name,
        downlinks: Array(finalDownlinksPerLeaf)
          .fill(null)
          .map((_, j) => ({
            id: `downlink-${j + 1}`,
            speed: network.nicPorts.speed,
          })),
        uplinks: Array(maxUplinksPerLeaf)
          .fill(null)
          .map((_, j) => ({
            id: `uplink-${j + 1}`,
            speed: network.nicPorts.speed,
          })),
      });
    }

    // Create spine switches
    const downlinksPerSpine = Math.ceil(
      (numLeafSwitches * maxUplinksPerLeaf) / finalSpineCount
    );
    for (let i = 0; i < finalSpineCount; i++) {
      design.spineSwitches.push({
        id: `${network.name}-spine-${i + 1}`,
        network: network.name,
        downlinks: Array(downlinksPerSpine)
          .fill(null)
          .map((_, j) => ({
            id: `downlink-${j + 1}`,
            speed: network.nicPorts.speed,
          })),
      });
    }

    // Connect servers to leaf switches with redundancy
    design.servers.forEach((server, serverIndex) => {
      const networkInfo = server.networks.find((n) => n.name === network.name);
      if (networkInfo) {
        networkInfo.ports.forEach((_, portIndex) => {
          // Distribute connections across different leaf switches for redundancy
          const targetLeafIndex = (serverIndex + portIndex) % numLeafSwitches;
          const targetLeaf = design.leafSwitches.find(
            (leaf) => leaf.id === `${network.name}-leaf-${targetLeafIndex + 1}`
          );

          if (targetLeaf && targetLeaf.downlinks) {
            const portOnLeaf = Math.floor(serverIndex / numLeafSwitches);
            if (portOnLeaf < targetLeaf.downlinks.length) {
              design.connections.push({
                id: `conn-server${serverIndex + 1}-${network.name}-port${
                  portIndex + 1
                }-to-leaf${targetLeafIndex + 1}`,
                source: `server-${serverIndex + 1}`,
                sourcePort: `${network.name}-port-${portIndex + 1}`,
                target: targetLeaf.id,
                targetPort: `downlink-${portOnLeaf + 1}`,
                speed: network.nicPorts.speed,
                network: network.name,
              });
            }
          }
        });
      }
    });

    // Connect leaf switches to spine switches
    design.leafSwitches.forEach((leaf, leafIndex) => {
      if (leaf.network === network.name && leaf.uplinks) {
        design.spineSwitches
          .filter((spine) => spine.network === network.name)
          .forEach((spine, spineIndex) => {
            const uplinksPerSpine = Math.floor(
              maxUplinksPerLeaf / finalSpineCount
            );
            const uplinkOffset = spineIndex * uplinksPerSpine;

            for (let i = 0; i < uplinksPerSpine; i++) {
              design.connections.push({
                id: `conn-${leaf.id}-to-${spine.id}-link${i + 1}`,
                source: leaf.id,
                sourcePort: `uplink-${uplinkOffset + i + 1}`,
                target: spine.id,
                targetPort: `downlink-${leafIndex * uplinksPerSpine + i + 1}`,
                speed: network.nicPorts.speed,
                network: network.name,
              });
            }
          });
      }
    });
  });

  return design;
};
