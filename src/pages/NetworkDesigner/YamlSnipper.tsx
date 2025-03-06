import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Editor from "@monaco-editor/react";
import { Copy } from "lucide-react";
import { toast } from "sonner";

const yaml = `servers:
  quantity: 10
  networks:
    - name: "frontend"
      type: "lacp"
      nic-ports:
        quantity: 2
        speed: "25G"
    - name: "gpu"
      type: "spine-leaf"
      oversubscription_ratio: "1:1"
      nic-ports:
        quantity: 4
        speed: "100G"

cisco-switches:
  - name: "9336C-FX2"
    networks:
      - type: "spine-leaf"
        switch-ports:
          - quantity: 36
            speed: "100G"

network-design:
  leaf-switches:
    - id: frontend-switch-1
      model: "9336C-FX2"
      network: frontend
      ports: 10 x 25G
    - id: frontend-switch-2
      model: "9336C-FX2"
      network: frontend
      ports: 10 x 25G
    - id: gpu-leaf-1
      model: "9336C-FX2"
      network: gpu
      downlinks: 14 x 100G
      uplinks: 18 x 100G
    - id: gpu-leaf-2
      model: "9336C-FX2"
      network: gpu
      downlinks: 14 x 100G
      uplinks: 18 x 100G
    - id: gpu-leaf-3
      model: "9336C-FX2"
      network: gpu
      downlinks: 12 x 100G
      uplinks: 18 x 100G
  spine-switches:
    - id: gpu-spine-1
      model: "9336C-FX2"
      network: gpu
      downlinks: 27 x 100G
    - id: gpu-spine-2
      model: "9336C-FX2"
      network: gpu
      downlinks: 27 x 100G

  connections:
    total: 114
    frontend: 20
    gpu: 94`;

export function YamlSnipper() {
  const { theme } = useTheme();
  const handleCopy = () => {
    navigator.clipboard.writeText(yaml);
    toast.success("YAML content has been copied to your clipboard.");
  };

  return (
    <Card className="w-full flex-1 col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>YAML</CardTitle>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2 lg:px-3"
          onClick={handleCopy}
        >
          <Copy className="h-4 w-4 mr-2" />
          <span>Copy</span>
        </Button>
      </CardHeader>
      <CardContent className="flex-1">
        <Editor
          defaultLanguage="yaml"
          defaultValue={yaml}
          theme={theme === "dark" ? "vs-dark" : "vs-light"}
          options={{
            readOnly: true,
          }}
        />
      </CardContent>
    </Card>
  );
}
