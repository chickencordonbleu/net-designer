import { generateNetworkDesign } from "./helpers/serverDesign.helpers";
import { NetworkDesignerForm } from "./components/NetworkDesignerForm";
import { YamlSnipper } from "./components/YamlSnipper";
import { NetworkDiagram } from "./components/NetworkDiagram/NetworkDiagram";
import { NetworkStats } from "./components/NetworkStats/NetworkStats";
import { useNetworkProject } from "@/entities/networkProjects";
import { useParams } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { ProjectNotFound } from "./components/PorjectNotFound";

export function NetworkDesigner() {
  const { id } = useParams();
  const { data: networkProject, isLoading } = useNetworkProject(id);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner />
      </div>
    );

  if (!networkProject) {
    return <ProjectNotFound />;
  }

  const networkDesign = generateNetworkDesign(networkProject);

  return (
    <div className="grid grid-cols-5 gap-6 h-full overflow-auto p-6">
      <NetworkStats networkDesign={networkDesign} />
      <NetworkDiagram networkDesign={networkDesign} />
      <NetworkDesignerForm networkProject={networkProject} />
      <YamlSnipper
        networkProject={networkProject}
        networkDesign={networkDesign}
      />
    </div>
  );
}
