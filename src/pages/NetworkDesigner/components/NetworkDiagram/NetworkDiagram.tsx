import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Workflow } from "lucide-react";
import { NetworkDesign } from "../../types/serverDesign.types";
import { Diagram } from "./Diagram";

interface NetworkDiagramProps {
  networkDesign: NetworkDesign;
}

export function NetworkDiagram({ networkDesign }: NetworkDiagramProps) {
  return (
    <Card className="w-full flex-1 col-span-3 h-[700px] pb-0">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex flex-col">
          <CardTitle className="flex items-center">
            <Workflow className="mr-2" size={20} />
            Topology Diagram
          </CardTitle>
          <CardDescription>Topology diagram of the network</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <Diagram networkDesign={networkDesign} />
      </CardContent>
    </Card>
  );
}
