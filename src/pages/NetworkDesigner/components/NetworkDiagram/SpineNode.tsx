import { BaseNode } from "@/components/base-node";
import {
  NodeHeader,
  NodeHeaderIcon,
  NodeHeaderTitle,
} from "@/components/node-header";
import { Position } from "@xyflow/react";
import { Network, Plus } from "lucide-react";
import { NetworkConnection, NetworkPort } from "../../types/serverDesign.types";
import SpineNodeDialog from "./SpineNodeDialog";
import { ButtonHandle } from "@/components/button-handle";
import { Button } from "@/components/ui/button";

interface Props {
  data: {
    id: string;
    label: string;
    downlinks: NetworkPort[];
    connections: NetworkConnection[];
  };
}

export function SpineNode({ data }: Props) {
  return (
    <BaseNode
      id={data.id}
      className="px-3 py-2 bg-blue-500 border-blue-600 w-[500px] text-white"
    >
      <NodeHeader className="-mx-3 -mt-2 border-b border-blue-400">
        <NodeHeaderIcon>
          <Network className="mr-1" size={16} />
        </NodeHeaderIcon>
        <NodeHeaderTitle>Spine</NodeHeaderTitle>
        <SpineNodeDialog
          label={data.label}
          downlinks={data.downlinks}
          connections={data.connections}
        />
      </NodeHeader>
      <div className="text-xs pt-2">
        <div className="flex justify-between">
          <span className="w-16">Name</span>
          <span>{data.label}</span>
        </div>
        <div className="flex items-center">
          <span className="w-20">Downlinks:</span>
          <span>{data.downlinks.length}</span>
        </div>
      </div>
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
