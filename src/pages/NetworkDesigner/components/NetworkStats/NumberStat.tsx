import { cloneElement, ReactElement } from "react";

interface NumberStatProps {
  icon: React.ReactNode;
  label: string;
  value: number;
}

export function NumberStat({ icon, label, value }: NumberStatProps) {
  return (
    <div className="bg-white rounded-lg p-4 border flex flex-col">
      <div className="text-gray-500 text-sm font-medium mb-1 flex items-center">
        {cloneElement(icon as ReactElement<{ className: string }>, {
          className: "mr-1 h-4 w-4",
        })}
        {label}
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
