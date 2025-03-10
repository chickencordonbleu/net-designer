import { useMemo, useCallback, useEffect } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import { NetworkDesign } from "../../types/serverDesign.types";
import "@xyflow/react/dist/style.css";
import { LeafNode } from "./LeafNode";
import { SpineNode } from "./SpineNode";
import { DownloadDiagram } from "./DownloadDiagram";
import { useTheme } from "@/components/theme-provider";
import ELK from "elkjs/lib/elk.bundled.js";
import { LabeledGroupNodeDemo } from "./LabeledGroupNodeDemo";
import { ServerNode } from "./ServerNode";

const nodeTypes: NodeTypes = {
  server: ServerNode,
  leaf: LeafNode,
  spine: SpineNode,
  labeledGroupNode: LabeledGroupNodeDemo,
};

interface DiagramProps {
  networkDesign: NetworkDesign;
  fullScreen: boolean;
}

const elk = new ELK();

// ELK layout options
const elkOptions = {
  "elk.algorithm": "layered",
  "elk.layered.spacing.nodeNodeBetweenLayers": "250",
  "elk.spacing.nodeNode": "500",
  "elk.direction": "UP",
  "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
  "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
  "elk.layered.crossingMinimization.forceNodeModelOrder": "true", // Enforce node order in each layer
  "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES", // Consider order for both nodes and edges
};

function DiagramDesign({ networkDesign, fullScreen }: DiagramProps) {
  const colorMode = useTheme().theme === "dark" ? "dark" : "light";
  const isDarkMode = colorMode === "dark";
  const [nodes, setNodes] = useNodesState<Node>([]);
  const [edges, setEdges] = useEdgesState<Edge>([]);
  const { fitView } = useReactFlow();

  useEffect(() => {
    fitView();
  }, [fullScreen, fitView]);

  // Create initial nodes without positions
  const initialNodes: Node[] = useMemo(() => {
    const result: Node[] = [];
    const frontendNodes: string[] = [];
    const gpuNodes: string[] = [];

    // Get unique networks
    const networks = Array.from(
      new Set([
        ...networkDesign.spineSwitches.map((s) => s.network),
        ...networkDesign.leafSwitches.map((l) => l.network),
      ])
    );

    // Add spine switches first (top layer)
    networks.forEach((network) => {
      const spines = networkDesign.spineSwitches.filter(
        (s) => s.network === network
      );

      spines.forEach((spine) => {
        result.push({
          id: spine.id,
          type: "spine",
          data: {
            id: spine.id,
            label: spine.id,
            downlinks: spine.downlinks,
            network,
            connections: networkDesign.connections.filter(
              (c) => c.target === spine.id
            ),
          },
          position: { x: 0, y: 0 }, // Initial position will be set by ELK
        });

        // Track nodes by network
        if (network === "frontend") {
          frontendNodes.push(spine.id);
        } else if (network === "gpu") {
          gpuNodes.push(spine.id);
        }
      });

      // Add leaf switches (middle layer)
      const leaves = networkDesign.leafSwitches.filter(
        (l) => l.network === network
      );

      leaves.forEach((leaf) => {
        const nodeData = {
          label: leaf.id,
          downlinks: leaf.downlinks,
          uplinks: leaf.uplinks,
          network,
          fromConnections: networkDesign.connections.filter(
            (c) => c.source === leaf.id
          ),
          toConnections: networkDesign.connections.filter(
            (c) => c.target === leaf.id
          ),
        };

        result.push({
          id: leaf.id,
          type: "leaf",
          data: nodeData,
          position: { x: 0, y: 0 }, // Initial position will be set by ELK
        });

        // Track nodes by network
        if (network === "frontend") {
          frontendNodes.push(leaf.id);
        } else if (network === "gpu") {
          gpuNodes.push(leaf.id);
        }
      });
    });

    // Add servers (bottom layer)
    networkDesign.servers.forEach((server) => {
      const networkData = server.networks.map((n) => ({
        name: n.name,
        ports: n.ports,
      }));

      result.push({
        id: server.id,
        type: "server",
        data: {
          id: server.id,
          label: server.id,
          networks: networkData,
          connections: networkDesign.connections.filter(
            (c) => c.source === server.id
          ),
        },
        position: { x: 0, y: 0 }, // Initial position will be set by ELK
      });

      // We no longer track servers in network groups
      // Server networks are tracked in the server data but not included in groups
    });

    // Add group nodes for networks (will be positioned after layout)
    if (frontendNodes.length > 0) {
      result.push({
        id: "group-frontend",
        type: "labeledGroupNode",
        data: {
          label: "Frontend Network",
          childNodeIds: frontendNodes,
        },
        position: { x: 0, y: 0 },
        style: {
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          borderColor: "#22c55e",
          width: 500, // Will be adjusted after layout
          height: 500, // Will be adjusted after layout
        },
      });
    }

    if (gpuNodes.length > 0) {
      result.push({
        id: "group-gpu",
        type: "labeledGroupNode",
        data: {
          label: "GPU Network",
          childNodeIds: gpuNodes,
        },
        position: { x: 0, y: 0 },
        style: {
          backgroundColor: "rgba(236, 72, 153, 0.1)",
          borderColor: "#ec4899",
          width: 1000, // Will be adjusted after layout
          height: 500, // Will be adjusted after layout
        },
      });
    }

    return result;
  }, [networkDesign]);

  // Create edges from connections
  const initialEdges: Edge[] = useMemo(() => {
    return networkDesign.connections.map((conn) => {
      // Determine edge style based on network
      let edgeStyle = {};

      if (conn.network === "frontend") {
        edgeStyle = { stroke: "#22c55e" }; // Green for frontend
      } else if (conn.network === "gpu") {
        edgeStyle = { stroke: "#ec4899" }; // Pink for gpu
      }

      // Use dark mode appropriate label background
      const labelBgStyle = isDarkMode
        ? { fill: "#1e293b", fillOpacity: 0.8 } // Dark slate background for dark mode
        : { fill: "#f1f5f9", fillOpacity: 0.7 }; // Light background for light mode

      // Use appropriate text color for the mode
      const labelStyle = {
        fontSize: 8,
        fill: isDarkMode ? "#e2e8f0" : "#334155", // Light text for dark mode, dark text for light mode
      };

      const numConnections = networkDesign.connections.filter(
        (c) => c.source === conn.source && c.target === conn.target
      ).length;

      return {
        id: conn.id,
        source: conn.source,
        target: conn.target,
        sourceHandle: conn.sourcePort,
        targetHandle: conn.targetPort,
        animated: true,
        style: edgeStyle,
        label: `${conn.speed} x ${numConnections}`,
        labelBgStyle: labelBgStyle,
        labelStyle: labelStyle,
        data: {
          speed: conn.speed,
          network: conn.network,
        },
      } satisfies Edge;
    });
  }, [networkDesign, isDarkMode]);

  // Apply ELK layout
  const getLayoutedElements = useCallback((nodes: Node[], edges: Edge[]) => {
    // Filter out group nodes for layout
    const nonGroupNodes = nodes.filter(
      (node) => !["group-frontend", "group-gpu"].includes(node.id)
    );

    // Create ELK graph format
    const elkGraph = {
      id: "root",
      layoutOptions: elkOptions,
      children: nonGroupNodes.map((node) => ({
        id: node.id,
        width: 180, // Approximate node width
        height: 70, // Approximate node height
        // Set node constraints based on type for layering
        layoutOptions: {
          "elk.layered.layering.layerId":
            node.type === "spine" ? "0" : node.type === "leaf" ? "1" : "2",
        },
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        sources: [edge.source],
        targets: [edge.target],
      })),
    };

    return elk.layout(elkGraph).then((layoutedGraph) => {
      // Apply layout changes to the nodes
      const layoutedNodes = nodes.map((node) => {
        // Skip group nodes initially
        if (["group-frontend", "group-gpu"].includes(node.id)) {
          return node;
        }

        const elkNode = layoutedGraph.children?.find((n) => n.id === node.id);
        if (elkNode) {
          return {
            ...node,
            position: {
              x: elkNode.x || 0,
              y: elkNode.y || 0,
            },
          };
        }
        return node;
      });

      // Now position and size the group nodes
      const finalNodes = layoutedNodes.map((node) => {
        if (node.id === "group-frontend" || node.id === "group-gpu") {
          const childIds = node.data.childNodeIds as string[];
          if (childIds.length === 0) return node;

          // Find min/max positions of child nodes (only leaf and spine switches)
          const childNodes = layoutedNodes.filter(
            (n) =>
              childIds.includes(n.id) &&
              (n.type === "leaf" || n.type === "spine")
          );
          if (childNodes.length === 0) return node;

          const positions = childNodes.map((n) => n.position);
          const minX = Math.min(...positions.map((p) => p.x)) - 10;
          const maxX = Math.max(...positions.map((p) => p.x + 500)) + 10;
          const minY = Math.min(...positions.map((p) => p.y)) - 60;
          const maxY = Math.max(...positions.map((p) => p.y + 70)) + 70;

          // Update group position and size
          return {
            ...node,
            position: { x: minX, y: minY },
            style: {
              ...node.style,
              width: maxX - minX,
              height: maxY - minY,
            },
          };
        }
        return node;
      });

      // Ensure group nodes are rendered below other nodes (z-index)
      const sortedNodes = [
        ...finalNodes.filter(
          (n) => n.id === "group-frontend" || n.id === "group-gpu"
        ),
        ...finalNodes.filter(
          (n) => n.id !== "group-frontend" && n.id !== "group-gpu"
        ),
      ];

      return { nodes: sortedNodes, edges };
    });
  }, []);

  // Run layout on initial render
  useEffect(() => {
    if (initialNodes.length > 0 && initialEdges.length > 0) {
      getLayoutedElements(initialNodes, initialEdges).then(
        ({ nodes: layoutedNodes, edges: layoutedEdges }) => {
          setNodes(layoutedNodes);
          setEdges(layoutedEdges);

          // Wait for nodes to render then fit the view
          setTimeout(() => {
            fitView({ padding: 0.2 });
          }, 50);
        }
      );
    }
  }, [
    initialNodes,
    initialEdges,
    getLayoutedElements,
    setNodes,
    setEdges,
    fitView,
  ]);

  return (
    <div className="w-full h-full border border-x-0 border-b-0 rounded-md overflow-hidden">
      <ReactFlow
        attributionPosition="bottom-right"
        colorMode={colorMode}
        deleteKeyCode={null}
        edges={edges}
        fitView
        minZoom={0.1}
        nodeTypes={nodeTypes}
        nodes={nodes}
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

export function Diagram({ networkDesign, fullScreen }: DiagramProps) {
  return (
    <ReactFlowProvider>
      <DiagramDesign networkDesign={networkDesign} fullScreen={fullScreen} />
    </ReactFlowProvider>
  );
}
