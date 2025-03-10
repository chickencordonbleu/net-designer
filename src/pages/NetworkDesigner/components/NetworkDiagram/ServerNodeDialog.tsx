import {
  DialogHeader,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Info } from "lucide-react";

interface ServerNodeDialogProps {
  label: string;
  networks: Array<{
    name: string;
    ports: string;
    speed: string;
  }>;
}

export default function ServerNodeDialog({
  label,
  networks,
}: ServerNodeDialogProps) {
  return (
    <Dialog>
      <DialogTrigger>
        <Info />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Server Configuration</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <h3 className="font-medium">Server: {label}</h3>
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Network Interfaces</h4>
            {networks.map((net) => (
              <div
                key={net.name}
                className="flex items-center justify-between py-1 border-b"
              >
                <span>{net.name.toUpperCase()}</span>
                <span>
                  {net.ports} x {net.speed}
                </span>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
