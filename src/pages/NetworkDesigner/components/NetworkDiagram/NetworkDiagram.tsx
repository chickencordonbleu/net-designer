import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Download, Workflow } from "lucide-react";
import { NetworkDesign } from "../../types/serverDesign.types";
import { Diagram } from "./Diagram";
import { toast } from "sonner";

interface NetworkDiagramProps {
  networkDesign: NetworkDesign;
}

export function NetworkDiagram({ networkDesign }: NetworkDiagramProps) {
  const handleDownload = () => {
    toast.success("To be implemented!");
  };

  return (
    <Card className="w-full flex-1 col-span-3 h-[700px]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex flex-col">
          <CardTitle className="flex items-center">
            <Workflow className="mr-2" size={20} />
            Topology Diagram
          </CardTitle>
          <CardDescription>Topology diagram of the network</CardDescription>
        </div>
        <Button
          onClick={handleDownload}
          variant="outline"
          size="sm"
          className="h-8 px-2 lg:px-3"
        >
          <Download className="h-4 w-4 mr-2" />
          <span>Download Diagram</span>
        </Button>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <Diagram networkDesign={networkDesign} />
      </CardContent>
    </Card>
  );
}
