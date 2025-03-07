import { Handle, Position } from "@xyflow/react";
import { Network } from "lucide-react";

interface Props {
  data: {
    label: string;
    downlinks: string;
  };
}

export function SpineNode({ data }: Props) {
  return (
    <>
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
      <Handle type="target" position={Position.Bottom} />
    </>
  );
}
