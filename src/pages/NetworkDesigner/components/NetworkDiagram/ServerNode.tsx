import { BaseNode } from "@/components/base-node";
import {
  NodeHeader,
  NodeHeaderIcon,
  NodeHeaderTitle,
} from "@/components/node-header";

import { Position } from "@xyflow/react";
import { Plus, Server } from "lucide-react";
import ServerNodeDialog from "./ServerNodeDialog";
import { NetworkConnection, NetworkPort } from "../../types/serverDesign.types";
import { ButtonHandle } from "@/components/button-handle";
import { Button } from "@/components/ui/button";

interface Props {
  data: {
    id: string;
    label: string;
    networks: Array<{
      name: string;
      ports: NetworkPort[];
    }>;
    connections: NetworkConnection[];
  };
}

export function ServerNode({ data }: Props) {
  return (
    <>
      <BaseNode
        id={data.id}
        className="px-3 py-2 bg-gray-700 border-gray-600 w-[500px] text-white"
      >
        <NodeHeader className="-mx-3 -mt-2 border-b border-gray-400">
          <NodeHeaderIcon>
            <Server className="mr-1" size={16} />
          </NodeHeaderIcon>
          <NodeHeaderTitle>Server</NodeHeaderTitle>
          <ServerNodeDialog
            label={data.label}
            networks={data.networks}
            connections={data.connections}
          />
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
                {net.ports.length} x {net.ports[0].speed}
              </span>
            </div>
          ))}
        </div>
        {[...data.networks.map((net) => net.ports).flat()].map(
          (port, index) => (
            <ButtonHandle
              key={port.id}
              type="source"
              position={Position.Top}
              id={port.id}
              style={{
                top: 0,
                left: `${
                  data.networks.map((net) => net.ports).flat().length === 1
                    ? 50
                    : (index * 100) /
                      (data.networks.map((net) => net.ports).flat().length - 1)
                }%`,
                right: "auto",
                bottom: "auto",
              }}
              showButton={false}
            >
              <Button size="sm" variant="secondary" className="rounded-full">
                <Plus size={10} />
              </Button>
            </ButtonHandle>
          )
        )}
      </BaseNode>
    </>
  );
}
