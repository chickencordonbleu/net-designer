import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import Editor from "@monaco-editor/react";
import { Code2, Copy } from "lucide-react";
import { toast } from "sonner";
import { generateYamlConfig } from "../helpers/yaml.helpers";
import { ServerConfig } from "../types/serverConfig.types";
import { NetworkDesign } from "../types/serverDesign.types";

interface YamlSnipperProps {
  networkDesign: NetworkDesign;
  serverConfig: ServerConfig;
}

export function YamlSnipper({ serverConfig, networkDesign }: YamlSnipperProps) {
  const { theme } = useTheme();
  const yaml = generateYamlConfig(serverConfig, networkDesign);

  const handleCopy = () => {
    navigator.clipboard.writeText(yaml);
    toast.success("YAML content has been copied to your clipboard.");
  };

  return (
    <Card className="w-full flex-1 col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex flex-col">
          <CardTitle className="flex items-center">
            <Code2 className="mr-2" size={20} />
            YAML
          </CardTitle>
          <CardDescription>
            YAML generated from the server configuration
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2 lg:px-3"
          onClick={handleCopy}
        >
          <Copy className="h-4 w-4 mr-2" />
          <span>Copy YAML</span>
        </Button>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <Editor
          defaultLanguage="yaml"
          value={yaml}
          theme={theme === "dark" ? "vs-dark" : "vs-light"}
          options={{
            readOnly: true,
          }}
        />
      </CardContent>
    </Card>
  );
}
