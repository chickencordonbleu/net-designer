import { Handle, Position } from "@xyflow/react";
import { Network } from "lucide-react";

export function SpineNode({ data }: { data: any }) {
  return (
    <>
      <Handle type="target" position={Position.Left} />
      <div className="p-2 bg-blue-500 rounded-md border-2 border-blue-600 w-56 text-white shadow-md">
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
      <Handle type="source" position={Position.Right} id="a" />
    </>
  );
}
