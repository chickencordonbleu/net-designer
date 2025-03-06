import { Handle, Position } from "@xyflow/react";
import { Leaf } from "lucide-react";

export function LeafNode({ data }: { data: any }) {
  return (
    <>
      <Handle type="target" position={Position.Left} />
      <div className="p-2 bg-purple-500 rounded-md border-2 border-purple-600 w-44 text-white shadow-md">
        <div className="flex items-center justify-center mb-1">
          <Leaf className="mr-1" size={16} />
          <div className="text-xs font-semibold">{data.label}</div>
        </div>
        <div className="text-xs">
          {data.downlinks && (
            <div className="flex items-center">
              <span className="w-20">Downlinks:</span>
              <span>{data.downlinks}</span>
            </div>
          )}
          {data.uplinks && (
            <div className="flex items-center">
              <span className="w-20">Uplinks:</span>
              <span>{data.uplinks}</span>
            </div>
          )}
          {data.ports && (
            <div className="flex items-center">
              <span className="w-20">Ports:</span>
              <span>{data.ports}</span>
            </div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Right} id="a" />
    </>
  );
}
