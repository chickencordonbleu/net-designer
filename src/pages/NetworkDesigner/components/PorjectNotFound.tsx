import { FolderX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export const ProjectNotFound = () => {
  const navigate = useNavigate();

  const handleAction = () => {
    navigate("../..", { relative: "path" });
  };

  return (
    <div className="flex justify-center items-center h-full">
      <Card className="w-full max-w-md mx-auto border-dashed">
        <CardContent className="flex flex-col items-center justify-center pt-10 pb-10 text-center space-y-6">
          <div className="bg-muted p-4 rounded-full">
            <FolderX className="h-10 w-10 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold tracking-tight">
              Project Not Found
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              We couldn't find the project you're looking for.
            </p>
          </div>

          <Button onClick={handleAction} variant="outline" className="mt-4">
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
