import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Maximize2, Workflow } from "lucide-react";
import { NetworkDesign } from "../../types/serverDesign.types";
import { Diagram } from "./Diagram";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { Button } from "@/components/ui/button";

interface NetworkDiagramProps {
  networkDesign: NetworkDesign;
}

export function NetworkDiagram({ networkDesign }: NetworkDiagramProps) {
  const handle = useFullScreenHandle();

  return (
    <Card className="w-full flex-1 col-span-5 h-[700px] pb-0">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex flex-col">
          <CardTitle className="flex items-center">
            <Workflow className="mr-2" size={20} />
            Topology Diagram
          </CardTitle>
          <CardDescription>Topology diagram of the network</CardDescription>
        </div>
        <div>
          <Button
            onClick={handle.enter}
            variant="outline"
            className="w-10 h-10 transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
            aria-label={handle.active ? "Exit fullscreen" : "Enter fullscreen"}
          >
            <Maximize2 size={20} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <FullScreen handle={handle} className="h-full">
          <Diagram networkDesign={networkDesign} fullScreen={handle.active} />
        </FullScreen>
      </CardContent>
    </Card>
  );
}
