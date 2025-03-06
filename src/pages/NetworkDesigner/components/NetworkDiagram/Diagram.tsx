import { useMemo } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
} from "@xyflow/react";
import { NetworkDesign } from "../../types/serverDesign.types";
import "@xyflow/react/dist/style.css";
import { ServerNode } from "./ServerNode";
import { LeafNode } from "./LeafNode";
import { SpineNode } from "./SpineNode";
import { DownloadDiagram } from "./DownloadDiagram";

const nodeTypes: NodeTypes = {
  server: ServerNode,
  leaf: LeafNode,
  spine: SpineNode,
};

interface DiagramProps {
  networkDesign: NetworkDesign;
}

export function Diagram({ networkDesign }: DiagramProps) {
  // Create diagram nodes
  const nodes: Node[] = useMemo(() => {
    const result: Node[] = [];
    const nodeSpacing = 300;
    const networkGroupSpacing = 700;

    // Get unique networks
    const networks = Array.from(
      new Set([
        ...networkDesign.spineSwitches.map((s) => s.network),
        ...networkDesign.leafSwitches.map((l) => l.network),
      ])
    );

    // Calculate positioning
    networks.forEach((network, networkIndex) => {
      const networkXOffset = networkIndex * networkGroupSpacing;

      // Add spine switches first (top layer)
      const spines = networkDesign.spineSwitches.filter(
        (s) => s.network === network
      );
      const spineWidth = spines.length * nodeSpacing;

      spines.forEach((spine, spineIndex) => {
        const xPos =
          networkXOffset +
          spineIndex * nodeSpacing -
          spineWidth / 2 +
          nodeSpacing / 2;
        result.push({
          id: spine.id,
          type: "spine",
          data: {
            label: spine.id,
            downlinks: `${spine.downlinks.length} x ${spine.downlinks[0].speed}`,
          },
          position: { x: xPos, y: 0 },
        });
      });

      // Add leaf switches (middle layer)
      const leaves = networkDesign.leafSwitches.filter(
        (l) => l.network === network
      );
      const leafWidth = leaves.length * nodeSpacing;

      leaves.forEach((leaf, leafIndex) => {
        const xPos =
          networkXOffset +
          leafIndex * nodeSpacing -
          leafWidth / 2 +
          nodeSpacing / 2;

        const nodeData: any = { label: leaf.id };

        if (leaf.downlinks && leaf.uplinks) {
          nodeData.downlinks = `${leaf.downlinks.length} x ${leaf.downlinks[0].speed}`;
          nodeData.uplinks = `${leaf.uplinks.length} x ${leaf.uplinks[0].speed}`;
        } else if (leaf.ports) {
          nodeData.ports = `${leaf.ports.length} x ${leaf.ports[0].speed}`;
        }

        result.push({
          id: leaf.id,
          type: "leaf",
          data: nodeData,
          position: { x: xPos, y: 200 },
        });
      });
    });

    // Add servers (bottom layer)
    const servers = networkDesign.servers;
    const serverWidth = servers.length * nodeSpacing;

    servers.forEach((server, serverIndex) => {
      const xPos =
        serverIndex * nodeSpacing - serverWidth / 2 + nodeSpacing / 2;

      const networkData = server.networks.map((n) => ({
        name: n.name,
        ports: n.ports.length,
        speed: n.ports[0].speed,
      }));

      result.push({
        id: server.id,
        type: "server",
        data: {
          label: server.id,
          networks: networkData,
        },
        position: { x: xPos, y: 400 },
      });
    });

    return result;
  }, [networkDesign]);

  // Create edges from connections
  const edges: Edge[] = useMemo(() => {
    return networkDesign.connections.map((conn) => {
      // Determine edge style based on network
      let edgeStyle = {};

      if (conn.network === "frontend") {
        edgeStyle = { stroke: "#22c55e" }; // Green for frontend
      } else if (conn.network === "gpu") {
        edgeStyle = { stroke: "#ec4899" }; // Pink for gpu
      }

      return {
        id: conn.id,
        source: conn.source,
        target: conn.target,
        animated: false,
        style: edgeStyle,
        data: {
          speed: conn.speed,
          network: conn.network,
        },
        label: conn.speed,
        labelBgStyle: { fill: "#f1f5f9", fillOpacity: 0.7 },
        labelStyle: { fontSize: 8 },
      };
    });
  }, [networkDesign]);

  return (
    <div className="w-full h-full border border-x-0 border-b-0 rounded-md overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
        proOptions={{ hideAttribution: true }}
      >
        <Controls />
        <MiniMap />
        <Background />
        <DownloadDiagram />
      </ReactFlow>
    </div>
  );
}
