import { Handle, Position } from "@xyflow/react";
import { Server } from "lucide-react";

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
      <div className="p-2 bg-gray-700 rounded-md border-2 border-gray-600 w-40 text-white shadow-md">
        <div className="flex items-center justify-center mb-1">
          <Server className="mr-1" size={16} />
          <div className="text-xs font-semibold">{data.label}</div>
        </div>
        <div className="text-xs text-gray-300">
          {data.networks?.map((net) => (
            <div key={net.name} className="flex items-center">
              <span className="w-16">{net.name}:</span>
              <span>
                {net.ports} x {net.speed}
              </span>
            </div>
          ))}
        </div>
      </div>
      <Handle type="source" position={Position.Top} id="a" />
    </>
  );
}
