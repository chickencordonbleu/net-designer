import { NetworkDesignerForm } from "./NetworkDesignerForm";
import { YamlSnipper } from "./YamlSnipper";

export function NetworkDesigner() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <NetworkDesignerForm />
      <YamlSnipper />
    </div>
  );
}
