import { BaseNode } from "@/components/base-node";
import {
  NodeHeader,
  NodeHeaderIcon,
  NodeHeaderTitle,
  NodeHeaderActions,
  NodeHeaderInfoAction,
} from "@/components/node-header";
import { Handle, Position } from "@xyflow/react";
import { Leaf } from "lucide-react";

interface Props {
  data: {
    label: string;
    downlinks: string;
    uplinks: string;
    ports: string;
  };
}

export function LeafNode({ data }: Props) {
  return (
    <BaseNode className="px-3 py-2 bg-purple-500 border-purple-600 w-48 text-white">
      <Handle type="source" position={Position.Top} id="a" />
      <NodeHeader className="-mx-3 -mt-2 border-b border-purple-400">
        <NodeHeaderIcon>
          <Leaf className="mr-1" size={16} />
        </NodeHeaderIcon>
        <NodeHeaderTitle>Leaf</NodeHeaderTitle>
        <NodeHeaderActions>
          <NodeHeaderInfoAction />
        </NodeHeaderActions>
      </NodeHeader>
      <div className="text-xs pt-2">
        <div className="flex justify-between">
          <span>Name</span>
          <span>{data.label}</span>
        </div>
        {data.uplinks && (
          <div className="flex justify-between">
            <span className="w-20">Uplinks:</span>
            <span>{data.uplinks}</span>
          </div>
        )}
        {data.downlinks && (
          <div className="flex justify-between">
            <span className="w-20">Downlinks:</span>
            <span>{data.downlinks}</span>
          </div>
        )}
        {data.ports && (
          <div className="flex justify-between">
            <span className="w-20">Ports:</span>
            <span>{data.ports}</span>
          </div>
        )}
      </div>
      <Handle type="target" position={Position.Bottom} />
    </BaseNode>
  );
}
