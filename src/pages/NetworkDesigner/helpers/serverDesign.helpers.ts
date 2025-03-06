import { ServerConfig } from "../types/serverConfig.types";
import {
  NetworkDesign,
  CISCO_SWITCH,
  LeafSwitch,
} from "../types/serverDesign.types";

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

  // For each network type, generate appropriate switch infrastructure
  networks.forEach((network) => {
    if (network.type === "spine-leaf") {
      // Switch port details - using cisco switch constants
      const totalPortsPerSwitch =
        CISCO_SWITCH.networks[0].switchPorts[0].quantity; // 36 for 9336C-FX2

      // Calculate number of server connections needed for this network
      const totalServerConnections =
        serverConfig.servers * network.nicPorts.quantity;

      // Calculate the number of leaf switches needed
      // For 1:1 non-blocking, we can use up to half the ports for downlinks and half for uplinks
      const maxDownlinksPerLeaf = Math.floor(totalPortsPerSwitch / 2);
      const maxUplinksPerLeaf = totalPortsPerSwitch - maxDownlinksPerLeaf;

      // Calculate the number of leaf switches needed to accommodate all server connections
      const numLeafSwitches = Math.ceil(
        totalServerConnections / maxDownlinksPerLeaf
      );

      // Distribute server connections evenly across leaf switches
      const serversPerLeaf = Math.ceil(
        totalServerConnections / numLeafSwitches
      );

      // Recalculate actual downlinks per leaf
      const finalDownlinksPerLeaf = Math.min(
        maxDownlinksPerLeaf,
        serversPerLeaf
      );

      // Calculate total uplinks needed from all leaf switches
      const totalUplinksNeeded = numLeafSwitches * maxUplinksPerLeaf;

      // Create leaf switches
      for (let i = 0; i < numLeafSwitches; i++) {
        const serverConnectionsForThisLeaf =
          i < numLeafSwitches - 1
            ? finalDownlinksPerLeaf
            : Math.min(
                finalDownlinksPerLeaf,
                totalServerConnections -
                  finalDownlinksPerLeaf * (numLeafSwitches - 1)
              );

        design.leafSwitches.push({
          id: `${network.name}-leaf-${i + 1}`,
          network: network.name,
          downlinks: Array(serverConnectionsForThisLeaf)
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

      // Calculate the number of spine switches needed
      const numSpineSwitches = Math.ceil(
        totalUplinksNeeded / totalPortsPerSwitch
      );

      // Ensure minimum 2 spines for redundancy
      const finalSpineCount = Math.max(2, numSpineSwitches);

      // Calculate downlinks per spine (uplinks from leaves)
      const downlinksPerSpine = Math.ceil(totalUplinksNeeded / finalSpineCount);

      // Create spine switches
      let remainingConnections = totalUplinksNeeded;
      for (let i = 0; i < finalSpineCount; i++) {
        const thisSpineDownlinks =
          i === finalSpineCount - 1
            ? remainingConnections
            : Math.min(downlinksPerSpine, remainingConnections);

        remainingConnections -= thisSpineDownlinks;

        design.spineSwitches.push({
          id: `${network.name}-spine-${i + 1}`,
          network: network.name,
          downlinks: Array(thisSpineDownlinks)
            .fill(null)
            .map((_, j) => ({
              id: `downlink-${j + 1}`,
              speed: network.nicPorts.speed,
            })),
        });
      }

      // Create connections between servers and leaf switches
      let serverPortsAllocated = 0;
      design.servers.forEach((server, serverIndex) => {
        const networkInfo = server.networks.find(
          (n) => n.name === network.name
        );
        if (networkInfo) {
          networkInfo.ports.forEach((port, portIndex) => {
            const targetLeafIndex = Math.floor(
              serverPortsAllocated / finalDownlinksPerLeaf
            );
            if (targetLeafIndex < numLeafSwitches) {
              const targetLeaf = design.leafSwitches.find(
                (leaf) =>
                  leaf.id === `${network.name}-leaf-${targetLeafIndex + 1}`
              );

              if (targetLeaf && targetLeaf.downlinks) {
                const portOnLeaf = serverPortsAllocated % finalDownlinksPerLeaf;
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
                  serverPortsAllocated++;
                }
              }
            }
          });
        }
      });

      // Create connections between leaf and spine switches
      design.leafSwitches.forEach((leaf, leafIndex) => {
        if (leaf.network === network.name && leaf.uplinks) {
          design.spineSwitches
            .filter((spine) => spine.network === network.name)
            .forEach((spine, spineIndex) => {
              // Calculate how many uplinks per leaf per spine
              const uplinksPerSpine = Math.floor(
                maxUplinksPerLeaf / finalSpineCount
              );
              const extraUplinks = maxUplinksPerLeaf % finalSpineCount;

              const uplinksToThisSpine =
                uplinksPerSpine + (spineIndex < extraUplinks ? 1 : 0);

              let uplinkIndexStart = 0;
              for (let s = 0; s < spineIndex; s++) {
                uplinkIndexStart +=
                  uplinksPerSpine + (s < extraUplinks ? 1 : 0);
              }

              for (
                let uplinkIndex = 0;
                uplinkIndex < uplinksToThisSpine;
                uplinkIndex++
              ) {
                const globalUplinkIndex = uplinkIndexStart + uplinkIndex;

                design.connections.push({
                  id: `conn-${leaf.id}-uplink${globalUplinkIndex + 1}-to-${
                    spine.id
                  }`,
                  source: leaf.id,
                  sourcePort: `uplink-${globalUplinkIndex + 1}`,
                  target: spine.id,
                  targetPort: `downlink-${
                    leafIndex * uplinksToThisSpine + uplinkIndex + 1
                  }`,
                  speed: network.nicPorts.speed,
                  network: network.name,
                });
              }
            });
        }
      });
    } else if (network.type === "lacp") {
      // For LACP networks, create a pair of switches for redundancy
      const lacpSwitch1: LeafSwitch = {
        id: `${network.name}-switch-1`,
        network: network.name,
        ports: Array(
          Math.ceil((serverConfig.servers * network.nicPorts.quantity) / 2)
        )
          .fill(null)
          .map((_, j) => ({
            id: `port-${j + 1}`,
            speed: network.nicPorts.speed,
          })),
      };

      const lacpSwitch2: LeafSwitch = {
        id: `${network.name}-switch-2`,
        network: network.name,
        ports: Array(
          Math.ceil((serverConfig.servers * network.nicPorts.quantity) / 2)
        )
          .fill(null)
          .map((_, j) => ({
            id: `port-${j + 1}`,
            speed: network.nicPorts.speed,
          })),
      };

      design.leafSwitches.push(lacpSwitch1, lacpSwitch2);

      // Create connections between servers and LACP switches
      design.servers.forEach((server, serverIndex) => {
        const networkInfo = server.networks.find(
          (n) => n.name === network.name
        );
        if (networkInfo) {
          networkInfo.ports.forEach((port, portIndex) => {
            const targetSwitch =
              portIndex % 2 === 0 ? lacpSwitch1 : lacpSwitch2;
            const portOnSwitch = Math.floor(serverIndex + portIndex / 2);

            if (
              targetSwitch.ports &&
              portOnSwitch < targetSwitch.ports.length
            ) {
              design.connections.push({
                id: `conn-server${serverIndex + 1}-${network.name}-port${
                  portIndex + 1
                }-to-${targetSwitch.id}-port${portOnSwitch + 1}`,
                source: `server-${serverIndex + 1}`,
                sourcePort: `${network.name}-port-${portIndex + 1}`,
                target: targetSwitch.id,
                targetPort: `port-${portOnSwitch + 1}`,
                speed: network.nicPorts.speed,
                network: network.name,
              });
            }
          });
        }
      });
    }
  });

  return design;
};
