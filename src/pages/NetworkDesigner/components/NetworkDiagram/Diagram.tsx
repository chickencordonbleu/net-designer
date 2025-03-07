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
import { ServerNode } from "./ServerNode";
import { LeafNode } from "./LeafNode";
import { SpineNode } from "./SpineNode";
import { DownloadDiagram } from "./DownloadDiagram";
import { useTheme } from "@/components/theme-provider";
import ELK from "elkjs/lib/elk.bundled.js";

const nodeTypes: NodeTypes = {
  server: ServerNode,
  leaf: LeafNode,
  spine: SpineNode,
};

interface DiagramProps {
  networkDesign: NetworkDesign;
}

const elk = new ELK();

// ELK layout options
const elkOptions = {
  "elk.algorithm": "layered",
  "elk.layered.spacing.nodeNodeBetweenLayers": "150",
  "elk.spacing.nodeNode": "80",
  "elk.direction": "UP",
  "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
  "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
};

function DiagramDesign({ networkDesign }: DiagramProps) {
  const colorMode = useTheme().theme === "dark" ? "dark" : "light";
  const isDarkMode = colorMode === "dark";
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();

  // Create initial nodes without positions
  const initialNodes: Node[] = useMemo(() => {
    const result: Node[] = [];

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
            label: spine.id,
            downlinks: `${spine.downlinks.length} x ${spine.downlinks[0].speed}`,
            network,
          },
          position: { x: 0, y: 0 }, // Initial position will be set by ELK
        });
      });

      // Add leaf switches (middle layer)
      const leaves = networkDesign.leafSwitches.filter(
        (l) => l.network === network
      );

      leaves.forEach((leaf) => {
        const nodeData = {
          label: leaf.id,
          downlinks: "",
          uplinks: "",
          ports: "",
          network,
        };

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
          position: { x: 0, y: 0 }, // Initial position will be set by ELK
        });
      });
    });

    // Add servers (bottom layer)
    networkDesign.servers.forEach((server) => {
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
        position: { x: 0, y: 0 }, // Initial position will be set by ELK
      });
    });

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

      return {
        id: conn.id,
        source: conn.source,
        target: conn.target,
        animated: true,
        style: edgeStyle,
        data: {
          speed: conn.speed,
          network: conn.network,
        },
        label: conn.speed,
        labelBgStyle: labelBgStyle,
        labelStyle: labelStyle,
      };
    });
  }, [networkDesign, isDarkMode]);

  // Apply ELK layout
  const getLayoutedElements = useCallback(
    (nodes: Node[], edges: Edge[]) => {
      // Create ELK graph format
      const elkGraph = {
        id: "root",
        layoutOptions: elkOptions,
        children: nodes.map((node) => ({
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

        return { nodes: layoutedNodes, edges };
      });
    },
    [elkOptions]
  );

  // Run layout on initial render
  useEffect(() => {
    if (initialNodes.length > 0 && initialEdges.length > 0) {
      setNodes(initialNodes);
      setEdges(initialEdges);

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
        edges={edges}
        fitView
        nodeTypes={nodeTypes}
        nodes={nodes}
        minZoom={0.1}
        onEdgesChange={onEdgesChange}
        onNodesChange={onNodesChange}
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

export function Diagram({ networkDesign }: DiagramProps) {
  return (
    <ReactFlowProvider>
      <DiagramDesign networkDesign={networkDesign} />
    </ReactFlowProvider>
  );
}
