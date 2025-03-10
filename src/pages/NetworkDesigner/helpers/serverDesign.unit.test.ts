import { describe, it, expect } from "vitest";
import { generateNetworkDesign } from "./serverDesign.helpers";
import { ServerConfig } from "@/entities/networkProjects";

describe("generateNetworkDesign", () => {
  it("should generate correct number of servers", () => {
    const config: ServerConfig = {
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
    };

    const design = generateNetworkDesign(config);

    expect(design.servers).toHaveLength(2);
    expect(design.servers[0].networks).toHaveLength(2);
    expect(design.servers[1].networks).toHaveLength(2);
  });

  it("should generate correct number of ports for each network", () => {
    const config: ServerConfig = {
      servers: 1,
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
    };

    const design = generateNetworkDesign(config);

    // Check frontend network ports
    const frontendPorts = design.servers[0].networks.find(
      (n) => n.name === "frontend"
    )?.ports;
    expect(frontendPorts).toHaveLength(2);
    expect(frontendPorts?.[0].speed).toBe("40G");

    // Check GPU network ports
    const gpuPorts = design.servers[0].networks.find(
      (n) => n.name === "gpu"
    )?.ports;
    expect(gpuPorts).toHaveLength(4);
    expect(gpuPorts?.[0].speed).toBe("100G");
  });

  it("should maintain consistent port speeds across connections", () => {
    const config: ServerConfig = {
      servers: 1,
      frontendNetwork: {
        networkType: "spine-leaf",
        oversubscriptionRatio: "1:1",
        nicPorts: 2,
        portSpeed: "40G",
      },
      gpuNetwork: {
        networkType: "spine-leaf",
        oversubscriptionRatio: "1:1",
        nicPorts: 2,
        portSpeed: "100G",
      },
    };

    const design = generateNetworkDesign(config);

    // Check frontend network connections
    const frontendConns = design.connections.filter(
      (c) => c.network === "frontend"
    );
    frontendConns.forEach((conn) => {
      expect(conn.speed).toBe("40G");
    });

    // Check GPU network connections
    const gpuConns = design.connections.filter((c) => c.network === "gpu");
    gpuConns.forEach((conn) => {
      expect(conn.speed).toBe("100G");
    });
  });
});

describe("Spine-Leaf Network Design Rules", () => {
  describe("Minimum Switch Requirements", () => {
    it("should have at least 2 spine switches per network", () => {
      const config: ServerConfig = {
        servers: 1,
        frontendNetwork: {
          networkType: "spine-leaf",
          oversubscriptionRatio: "1:1",
          nicPorts: 2,
          portSpeed: "40G",
        },
        gpuNetwork: {
          networkType: "spine-leaf",
          oversubscriptionRatio: "1:1",
          nicPorts: 2,
          portSpeed: "100G",
        },
      };

      const design = generateNetworkDesign(config);

      const frontendSpines = design.spineSwitches.filter(
        (s) => s.network === "frontend"
      );
      const gpuSpines = design.spineSwitches.filter((s) => s.network === "gpu");

      expect(frontendSpines.length).toBeGreaterThanOrEqual(2);
      expect(gpuSpines.length).toBeGreaterThanOrEqual(2);
    });

    it("should have at least 2 leaf switches per network", () => {
      const config: ServerConfig = {
        servers: 4,
        frontendNetwork: {
          networkType: "spine-leaf",
          oversubscriptionRatio: "1:1",
          nicPorts: 2,
          portSpeed: "40G",
        },
        gpuNetwork: {
          networkType: "spine-leaf",
          oversubscriptionRatio: "1:1",
          nicPorts: 2,
          portSpeed: "100G",
        },
      };

      const design = generateNetworkDesign(config);

      const frontendLeaves = design.leafSwitches.filter(
        (l) => l.network === "frontend"
      );
      const gpuLeaves = design.leafSwitches.filter((l) => l.network === "gpu");

      expect(frontendLeaves.length).toBeGreaterThanOrEqual(2);
      expect(gpuLeaves.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Leaf-to-Spine Ratio", () => {
    it("should have number of leaf switches >= number of spine switches", () => {
      const config: ServerConfig = {
        servers: 8,
        frontendNetwork: {
          networkType: "spine-leaf",
          oversubscriptionRatio: "1:1",
          nicPorts: 4,
          portSpeed: "40G",
        },
        gpuNetwork: {
          networkType: "spine-leaf",
          oversubscriptionRatio: "1:1",
          nicPorts: 4,
          portSpeed: "100G",
        },
      };

      const design = generateNetworkDesign(config);

      ["frontend", "gpu"].forEach((network) => {
        const spines = design.spineSwitches.filter(
          (s) => s.network === network
        ).length;
        const leaves = design.leafSwitches.filter(
          (l) => l.network === network
        ).length;
        expect(leaves).toBeGreaterThanOrEqual(spines);
      });
    });
  });

  describe("Full Connectivity Rules", () => {
    it("should connect every leaf to every spine within each network", () => {
      const config: ServerConfig = {
        servers: 4,
        frontendNetwork: {
          networkType: "spine-leaf",
          oversubscriptionRatio: "1:1",
          nicPorts: 2,
          portSpeed: "40G",
        },
        gpuNetwork: {
          networkType: "spine-leaf",
          oversubscriptionRatio: "1:1",
          nicPorts: 2,
          portSpeed: "100G",
        },
      };

      const design = generateNetworkDesign(config);

      ["frontend", "gpu"].forEach((network) => {
        const spines = design.spineSwitches.filter(
          (s) => s.network === network
        );
        const leaves = design.leafSwitches.filter((l) => l.network === network);

        leaves.forEach((leaf) => {
          spines.forEach((spine) => {
            const hasConnection = design.connections.some(
              (conn) =>
                (conn.source === leaf.id && conn.target === spine.id) ||
                (conn.source === spine.id && conn.target === leaf.id)
            );
            expect(hasConnection).toBe(true);
          });
        });
      });
    });

    it("should not have spine-to-spine connections", () => {
      const config: ServerConfig = {
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
          nicPorts: 2,
          portSpeed: "100G",
        },
      };

      const design = generateNetworkDesign(config);

      const spineToSpineConnections = design.connections.filter(
        (conn) =>
          design.spineSwitches.some((s) => s.id === conn.source) &&
          design.spineSwitches.some((s) => s.id === conn.target)
      );

      expect(spineToSpineConnections.length).toBe(0);
    });

    it("should not have leaf-to-leaf connections", () => {
      const config: ServerConfig = {
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
          nicPorts: 2,
          portSpeed: "100G",
        },
      };

      const design = generateNetworkDesign(config);

      const leafToLeafConnections = design.connections.filter(
        (conn) =>
          design.leafSwitches.some((l) => l.id === conn.source) &&
          design.leafSwitches.some((l) => l.id === conn.target)
      );

      expect(leafToLeafConnections.length).toBe(0);
    });
  });

  describe("Server Connectivity Rules", () => {
    it("should connect servers only to leaf switches", () => {
      const config: ServerConfig = {
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
          nicPorts: 2,
          portSpeed: "100G",
        },
      };

      const design = generateNetworkDesign(config);

      const serverConnections = design.connections.filter((conn) =>
        conn.source.startsWith("server-")
      );

      serverConnections.forEach((conn) => {
        expect(design.leafSwitches.some((l) => l.id === conn.target)).toBe(
          true
        );
      });
    });

    it("should connect each server to at least 2 different leaf switches per network", () => {
      const config: ServerConfig = {
        servers: 1,
        frontendNetwork: {
          networkType: "spine-leaf",
          oversubscriptionRatio: "1:1",
          nicPorts: 4,
          portSpeed: "40G",
        },
        gpuNetwork: {
          networkType: "spine-leaf",
          oversubscriptionRatio: "1:1",
          nicPorts: 4,
          portSpeed: "100G",
        },
      };

      const design = generateNetworkDesign(config);

      ["frontend", "gpu"].forEach((network) => {
        design.servers.forEach((server) => {
          const uniqueLeafConnections = new Set(
            design.connections
              .filter(
                (conn) => conn.source === server.id && conn.network === network
              )
              .map((conn) => conn.target)
          );

          expect(uniqueLeafConnections.size).toBeGreaterThanOrEqual(2);
        });
      });
    });
  });

  describe("Spine-Leaf Port Numbering", () => {
    it("should start port numbering from 1 for each network type", () => {
      const config: ServerConfig = {
        servers: 4,
        frontendNetwork: {
          networkType: "spine-leaf",
          oversubscriptionRatio: "1:1",
          nicPorts: 2,
          portSpeed: "40G",
        },
        gpuNetwork: {
          networkType: "spine-leaf",
          oversubscriptionRatio: "1:1",
          nicPorts: 2,
          portSpeed: "100G",
        },
      };

      const design = generateNetworkDesign(config);

      // Check frontend network port numbering
      const frontendSpineConns = design.connections.filter(
        (conn) =>
          conn.network === "frontend" &&
          design.spineSwitches.some((s) => s.id === conn.target)
      );

      const frontendPortNumbers = frontendSpineConns.map((conn) =>
        parseInt(conn.targetPort.replace("downlink-", ""))
      );
      expect(Math.min(...frontendPortNumbers)).toBe(1);

      // Check GPU network port numbering
      const gpuSpineConns = design.connections.filter(
        (conn) =>
          conn.network === "gpu" &&
          design.spineSwitches.some((s) => s.id === conn.target)
      );

      const gpuPortNumbers = gpuSpineConns.map((conn) =>
        parseInt(conn.targetPort.replace("downlink-", ""))
      );
      expect(Math.min(...gpuPortNumbers)).toBe(1);
    });

    it("should not reuse the same port on a spine switch", () => {
      const config: ServerConfig = {
        servers: 4,
        frontendNetwork: {
          networkType: "spine-leaf",
          oversubscriptionRatio: "1:1",
          nicPorts: 2,
          portSpeed: "40G",
        },
        gpuNetwork: {
          networkType: "spine-leaf",
          oversubscriptionRatio: "1:1",
          nicPorts: 2,
          portSpeed: "100G",
        },
      };

      const design = generateNetworkDesign(config);

      // Check for port uniqueness within each spine switch
      design.spineSwitches.forEach((spine) => {
        const spineConns = design.connections.filter(
          (conn) => conn.target === spine.id
        );
        const usedPorts = spineConns.map((conn) => conn.targetPort);
        const uniquePorts = new Set(usedPorts);
        expect(usedPorts.length).toBe(uniquePorts.size);
      });
    });

    it("should maintain consistent port numbering pattern across leaf switches", () => {
      const config: ServerConfig = {
        servers: 4,
        frontendNetwork: {
          networkType: "spine-leaf",
          oversubscriptionRatio: "1:1",
          nicPorts: 2,
          portSpeed: "40G",
        },
        gpuNetwork: {
          networkType: "spine-leaf",
          oversubscriptionRatio: "1:1",
          nicPorts: 2,
          portSpeed: "100G",
        },
      };

      const design = generateNetworkDesign(config);

      ["frontend", "gpu"].forEach((networkName) => {
        const networkSpines = design.spineSwitches.filter(
          (s) => s.network === networkName
        );
        const networkLeaves = design.leafSwitches.filter(
          (l) => l.network === networkName
        );

        networkSpines.forEach((spine) => {
          const spineConns = design.connections.filter(
            (conn) => conn.target === spine.id
          );

          // Check that port numbers increment consistently for each leaf
          const portsByLeaf = new Map();
          spineConns.forEach((conn) => {
            const leafIndex = networkLeaves.findIndex(
              (l) => l.id === conn.source
            );
            const portNum = parseInt(conn.targetPort.replace("downlink-", ""));

            if (!portsByLeaf.has(leafIndex)) {
              portsByLeaf.set(leafIndex, []);
            }
            portsByLeaf.get(leafIndex).push(portNum);
          });

          // Verify port numbers are sequential within each leaf's connections
          portsByLeaf.forEach((ports) => {
            ports.sort((a: number, b: number) => a - b);
            for (let i = 1; i < ports.length; i++) {
              expect(ports[i] - ports[i - 1]).toBe(1);
            }
          });
        });
      });
    });

    it("should handle maximum port capacity correctly", () => {
      const config: ServerConfig = {
        servers: 16, // Large number to test capacity limits
        frontendNetwork: {
          networkType: "spine-leaf",
          oversubscriptionRatio: "1:1",
          nicPorts: 4,
          portSpeed: "40G",
        },
        gpuNetwork: {
          networkType: "spine-leaf",
          oversubscriptionRatio: "1:1",
          nicPorts: 4,
          portSpeed: "100G",
        },
      };

      const design = generateNetworkDesign(config);

      design.spineSwitches.forEach((spine) => {
        const spineConns = design.connections.filter(
          (conn) => conn.target === spine.id
        );

        // Check that we don't exceed the number of available downlink ports
        expect(spineConns.length).toBeLessThanOrEqual(spine.downlinks.length);

        // Verify port numbers don't exceed available ports
        spineConns.forEach((conn) => {
          const portNum = parseInt(conn.targetPort.replace("downlink-", ""));
          expect(portNum).toBeLessThanOrEqual(spine.downlinks.length);
        });
      });
    });
  });
});
