import { BaseNode } from "@/components/base-node";
import {
  NodeHeader,
  NodeHeaderIcon,
  NodeHeaderTitle,
} from "@/components/node-header";
import { Handle, Position } from "@xyflow/react";
import { Network } from "lucide-react";
import { NetworkConnection } from "../../types/serverDesign.types";
import SpineNodeDialog from "./SpineNodeDialog";

interface Props {
  data: {
    label: string;
    downlinks: string;
    connections: NetworkConnection[];
  };
}

export function SpineNode({ data }: Props) {
  return (
    <BaseNode className="px-3 py-2 bg-blue-500 border-blue-600 w-56 text-white">
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
          <span>{data.downlinks}</span>
        </div>
      </div>
      <Handle type="target" position={Position.Bottom} />
    </BaseNode>
  );
}
