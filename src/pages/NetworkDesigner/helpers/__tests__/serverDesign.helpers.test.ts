import { generateNetworkDesign } from "../serverDesign.helpers";
import {
  ServerConfig,
  NetworkType,
  OversubscriptionRatio,
  PortSpeed,
} from "@/entities/networkProjects/types";
import { describe, it, expect } from "vitest";

describe("generateNetworkDesign", () => {
  const baseConfig: ServerConfig = {
    servers: 4,
    frontendNetwork: {
      networkType: "spine-leaf" as NetworkType,
      oversubscriptionRatio: "1:1" as OversubscriptionRatio,
      nicPorts: 2,
      portSpeed: "10G" as PortSpeed,
    },
    gpuNetwork: {
      networkType: "spine-leaf" as NetworkType,
      oversubscriptionRatio: "1:1" as OversubscriptionRatio,
      nicPorts: 2,
      portSpeed: "100G" as PortSpeed,
    },
  };

  it("should create the correct number of servers with ports", () => {
    const design = generateNetworkDesign(baseConfig);

    // Check server count
    expect(design.servers.length).toBe(baseConfig.servers);

    // Check each server has correct networks and ports
    design.servers.forEach((server) => {
      expect(server.networks.length).toBe(2); // frontend and gpu networks

      // Check frontend network ports
      const frontendNetwork = server.networks.find(
        (n) => n.name === "frontend"
      );
      expect(frontendNetwork?.ports.length).toBe(
        baseConfig.frontendNetwork.nicPorts
      );
      frontendNetwork?.ports.forEach((port) => {
        expect(port.speed).toBe(baseConfig.frontendNetwork.portSpeed);
      });

      // Check GPU network ports
      const gpuNetwork = server.networks.find((n) => n.name === "gpu");
      expect(gpuNetwork?.ports.length).toBe(baseConfig.gpuNetwork.nicPorts);
      gpuNetwork?.ports.forEach((port) => {
        expect(port.speed).toBe(baseConfig.gpuNetwork.portSpeed);
      });
    });
  });

  it("should ensure all server ports are connected", () => {
    const design = generateNetworkDesign(baseConfig);
    const totalPortsPerServer =
      baseConfig.frontendNetwork.nicPorts + baseConfig.gpuNetwork.nicPorts;
    const expectedConnections = baseConfig.servers * totalPortsPerServer;

    // Count server connections
    const serverConnections = design.connections.filter((conn) =>
      conn.source.startsWith("server-")
    );

    expect(serverConnections.length).toBe(expectedConnections);
  });

  it("should distribute connections across leaf switches", () => {
    const design = generateNetworkDesign(baseConfig);

    // Group connections by leaf switch
    const connectionsPerLeaf = design.leafSwitches.reduce((acc, leaf) => {
      acc[leaf.id] = design.connections.filter(
        (conn) => conn.target === leaf.id
      ).length;
      return acc;
    }, {} as Record<string, number>);

    // Check if connections are somewhat evenly distributed
    const connectionCounts = Object.values(connectionsPerLeaf);
    const maxDifference =
      Math.max(...connectionCounts) - Math.min(...connectionCounts);
    expect(maxDifference).toBeLessThanOrEqual(1); // Allow at most 1 connection difference
  });

  it("should not reuse ports on leaf switches", () => {
    const design = generateNetworkDesign(baseConfig);

    // Check for duplicate port usage on leaf switches
    design.leafSwitches.forEach((leaf) => {
      const usedPorts = new Set<string>();
      const leafConnections = design.connections.filter(
        (conn) => conn.target === leaf.id
      );

      leafConnections.forEach((conn) => {
        expect(usedPorts.has(conn.targetPort)).toBeFalsy();
        usedPorts.add(conn.targetPort);
      });
    });
  });

  it("should not reuse server ports", () => {
    const design = generateNetworkDesign(baseConfig);

    // Check for duplicate port usage on servers
    design.servers.forEach((server) => {
      const usedPorts = new Set<string>();
      const serverConnections = design.connections.filter(
        (conn) => conn.source === server.id
      );

      serverConnections.forEach((conn) => {
        expect(usedPorts.has(conn.sourcePort)).toBeFalsy();
        usedPorts.add(conn.sourcePort);
      });
    });
  });

  it("should handle edge case with more servers than available ports", () => {
    const largeConfig: ServerConfig = {
      ...baseConfig,
      servers: 1000, // Intentionally large number
    };

    const design = generateNetworkDesign(largeConfig);

    // Verify that leaf switches are created with correct port counts
    design.leafSwitches.forEach((leaf) => {
      expect(leaf.downlinks?.length).toBeGreaterThan(0);
      expect(leaf.uplinks?.length).toBeGreaterThan(0);
    });
  });

  it("should maintain network separation between frontend and gpu networks", () => {
    const design = generateNetworkDesign(baseConfig);

    // Check that connections stay within their respective networks
    design.connections.forEach((conn) => {
      if (conn.network === "frontend") {
        expect(conn.sourcePort).toContain("frontend");
        expect(conn.target).toContain("frontend");
      } else if (conn.network === "gpu") {
        expect(conn.sourcePort).toContain("gpu");
        expect(conn.target).toContain("gpu");
      }
    });
  });

  it("should create spine-leaf connections correctly", () => {
    const design = generateNetworkDesign(baseConfig);

    // Check spine to leaf connections
    design.leafSwitches.forEach((leaf) => {
      const leafUplinks = design.connections.filter(
        (conn) => conn.source === leaf.id && conn.target.includes("spine")
      );

      // Each leaf should have connections to all spines
      const connectedSpines = new Set(leafUplinks.map((conn) => conn.target));
      expect(connectedSpines.size).toBe(
        design.spineSwitches.filter((s) => s.network === leaf.network).length
      );
    });
  });
});
