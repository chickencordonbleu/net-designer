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
import { Server, Network } from "lucide-react";

// Custom node types
const ServerNode = ({ data }: { data: any }) => (
  <div className="p-2 bg-gray-700 rounded-md border-2 border-gray-600 w-32 text-white shadow-md">
    <div className="flex items-center justify-center mb-1">
      <Server className="mr-1" size={16} />
      <div className="text-xs font-semibold">{data.label}</div>
    </div>
    <div className="text-xs text-gray-300">
      {data.networks?.map((net: any) => (
        <div key={net.name} className="flex items-center">
          <span className="w-16">{net.name}:</span>
          <span>
            {net.ports} x {net.speed}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const LeafNode = ({ data }: { data: any }) => (
  <div className="p-2 bg-purple-500 rounded-md border-2 border-purple-600 w-36 text-white shadow-md">
    <div className="flex items-center justify-center mb-1">
      <Network className="mr-1" size={16} />
      <div className="text-xs font-semibold">{data.label}</div>
    </div>
    <div className="text-xs">
      {data.downlinks && (
        <div className="flex items-center">
          <span className="w-20">Downlinks:</span>
          <span>{data.downlinks}</span>
        </div>
      )}
      {data.uplinks && (
        <div className="flex items-center">
          <span className="w-20">Uplinks:</span>
          <span>{data.uplinks}</span>
        </div>
      )}
      {data.ports && (
        <div className="flex items-center">
          <span className="w-20">Ports:</span>
          <span>{data.ports}</span>
        </div>
      )}
    </div>
  </div>
);

const SpineNode = ({ data }: { data: any }) => (
  <div className="p-2 bg-blue-500 rounded-md border-2 border-blue-600 w-36 text-white shadow-md">
    <div className="flex items-center justify-center mb-1">
      <Network className="mr-1" size={16} />
      <div className="text-xs font-semibold">{data.label}</div>
    </div>
    <div className="text-xs">
      <div className="flex items-center">
        <span className="w-20">Downlinks:</span>
        <span>{data.downlinks}</span>
      </div>
    </div>
  </div>
);

interface DiagramProps {
  networkDesign: NetworkDesign;
}

export function Diagram({ networkDesign }: DiagramProps) {
  const nodeTypes: NodeTypes = useMemo(
    () => ({
      server: ServerNode,
      leaf: LeafNode,
      spine: SpineNode,
    }),
    []
  );

  // Create diagram nodes
  const nodes: Node[] = useMemo(() => {
    const result: Node[] = [];
    const nodeSpacing = 150;
    const networkGroupSpacing = 600;

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
    <div className="w-full h-[800px] border rounded-md overflow-hidden">
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
      </ReactFlow>
    </div>
  );
}
