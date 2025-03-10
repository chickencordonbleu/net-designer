import { BaseNode } from "@/components/base-node";
import {
  NodeHeader,
  NodeHeaderIcon,
  NodeHeaderTitle,
} from "@/components/node-header";
import { Leaf, Plus } from "lucide-react";
import LeafNodeDialog from "./LeafNodeDialog";
import { NetworkConnection, NetworkPort } from "../../types/serverDesign.types";
import { ButtonHandle } from "@/components/button-handle";
import { Button } from "@/components/ui/button";
import { Position } from "@xyflow/react";

interface Props {
  data: {
    id: string;
    label: string;
    downlinks: NetworkPort[];
    uplinks: NetworkPort[];
    fromConnections: NetworkConnection[];
    toConnections: NetworkConnection[];
  };
}

export function LeafNode({ data }: Props) {
  return (
    <BaseNode
      id={data.id}
      className="px-3 py-2 bg-purple-500 border-purple-600 w-[500px] text-white"
    >
      <NodeHeader className="-mx-3 -mt-2 border-b border-purple-400">
        <NodeHeaderIcon>
          <Leaf className="mr-1" size={16} />
        </NodeHeaderIcon>
        <NodeHeaderTitle>Leaf</NodeHeaderTitle>
        <LeafNodeDialog
          label={data.label}
          downlinks={data.downlinks}
          uplinks={data.uplinks}
          fromConnections={data.fromConnections}
          toConnections={data.toConnections}
        />
      </NodeHeader>
      <div className="text-xs pt-2">
        <div className="flex justify-between">
          <span>Name</span>
          <span>{data.label}</span>
        </div>
        {data.uplinks && (
          <div className="flex justify-between">
            <span className="w-20">Uplinks:</span>
            <span>{data.uplinks.length}</span>
          </div>
        )}
        {data.downlinks && (
          <div className="flex justify-between">
            <span className="w-20">Downlinks:</span>
            <span>{data.downlinks.length}</span>
          </div>
        )}
      </div>
      {data.uplinks.map((port, index) => (
        <ButtonHandle
          key={port.id}
          type="source"
          position={Position.Top}
          id={port.id}
          showButton={false}
          style={{
            top: 0,
            left: `${
              data.uplinks.length === 1
                ? 50
                : (index * 100) / (data.uplinks.length - 1)
            }%`,
            right: "auto",
            bottom: "auto",
          }}
        >
          <Button size="sm" variant="secondary" className="rounded-full">
            <Plus size={10} />
          </Button>
        </ButtonHandle>
      ))}
      {data.downlinks.map((port, index) => (
        <ButtonHandle
          key={port.id}
          type="target"
          position={Position.Bottom}
          id={port.id}
          showButton={false}
          style={{
            left: `${
              data.downlinks.length === 1
                ? 50
                : (index * 100) / (data.downlinks.length - 1)
            }%`,
            right: "auto",
          }}
        >
          <Button size="sm" variant="secondary" className="rounded-full">
            <Plus size={10} />
          </Button>
        </ButtonHandle>
      ))}
    </BaseNode>
  );
}
