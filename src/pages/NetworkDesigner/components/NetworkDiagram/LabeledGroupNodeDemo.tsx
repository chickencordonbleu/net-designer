import { memo } from "react";

import { NodeProps } from "@xyflow/react";
import { GroupNode } from "@/components/labeled-group-node";

interface LabeledGroupNodeDemoProps extends NodeProps {
  data: { label: string };
}

export const LabeledGroupNodeDemo = memo(
  ({ data, selected }: LabeledGroupNodeDemoProps) => {
    return <GroupNode selected={selected} label={data.label} />;
  }
);
