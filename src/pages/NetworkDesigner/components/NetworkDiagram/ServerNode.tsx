import { BaseNode } from "@/components/base-node";
import {
  NodeHeader,
  NodeHeaderIcon,
  NodeHeaderTitle,
  NodeHeaderActions,
  NodeHeaderInfoAction,
} from "@/components/node-header";

import { Handle, Position } from "@xyflow/react";
import { Server } from "lucide-react";
import ServerNodeDialog from "./ServerNodeDialog";

interface Props {
  data: {
    label: string;
    networks: Array<{
      name: string;
      ports: string;
      speed: string;
    }>;
  };
}

export function ServerNode({ data }: Props) {
  return (
    <>
      <BaseNode className="px-3 py-2 bg-gray-700 border-gray-600 w-44 text-white">
        <NodeHeader className="-mx-3 -mt-2 border-b border-gray-400">
          <NodeHeaderIcon>
            <Server className="mr-1" size={16} />
          </NodeHeaderIcon>
          <NodeHeaderTitle>Server</NodeHeaderTitle>
          <ServerNodeDialog label={data.label} networks={data.networks} />
        </NodeHeader>
        <div className="text-xs text-gray-300 pt-2">
          <div className="flex justify-between">
            <span className="w-16">Name</span>
            <span>{data.label}</span>
          </div>
          {data.networks?.map((net) => (
            <div key={net.name} className="flex justify-between">
              <span className="w-16">{net.name.toUpperCase()}:</span>
              <span>
                {net.ports} x {net.speed}
              </span>
            </div>
          ))}
        </div>
        <Handle type="source" position={Position.Top} id="a" />
      </BaseNode>
    </>
  );
}
