import { count } from "console";
import { Activity } from "lucide-react";
import { cloneElement, ReactElement } from "react";

interface BarStatProps {
  title: string;
  icon: React.ReactNode;
  items: {
    label: string;
    value: number;
  }[];
}

const colorMap = [
  "bg-emerald-500",
  "bg-purple-500",
  "bg-blue-500",
  "bg-red-500",
  "bg-yellow-500",
];

export default function BarStat({ title, icon, items }: BarStatProps) {
  const total = items.reduce((acc, item) => acc + item.value, 0);
  return (
    <div className="bg-white rounded-lg p-5 border">
      <h3 className="font-medium text-sm text-gray-500 mb-3 flex items-center">
        {cloneElement(icon as ReactElement<{ className: string }>, {
          className: "mr-2 h-4 w-4",
        })}
        {title}
      </h3>
      <div className="space-y-3">
        {items.map(({ label, value }, index) => (
          <div key={label} className="flex flex-col">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-sm">{label}</span>
              <span className="font-bold">{value}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${colorMap[index]}`}
                style={{
                  width: `${(value / total) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
