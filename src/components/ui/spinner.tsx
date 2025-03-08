import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SpinnerProps {
  className?: string;
  size?: "default" | "sm" | "lg" | "xl";
}

export function Spinner({ className, size = "default" }: SpinnerProps) {
  const sizeClasses = {
    default: "h-6 w-6",
    sm: "h-3 w-3",
    lg: "h-6 w-6",
    xl: "h-8 w-8",
  };

  return (
    <Loader2 className={cn("animate-spin", sizeClasses[size], className)} />
  );
}
