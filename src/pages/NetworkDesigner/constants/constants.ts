import {
  NetworkType,
  OversubscriptionRatio,
  PortSpeed,
} from "@/entities/networkProjects/types";

export const NETWORK_TYPES: { value: NetworkType; label: string }[] = [
  { value: "spine-leaf", label: "Spine-Leaf" },
  { value: "lacp", label: "LACP" },
];

export const OVERSUBSCRIPTION_RATIOS: {
  value: OversubscriptionRatio;
  label: string;
}[] = [
  { value: "1:1", label: "1:1 (Non-blocking)" },
  { value: "2:1", label: "2:1 (Oversubscription)" },
  { value: "3:1", label: "3:1 (Oversubscription)" },
];

export const PORT_SPEEDS: { value: PortSpeed; label: string }[] = [
  { value: "10G", label: "10G" },
  { value: "25G", label: "25G" },
  { value: "40G", label: "40G" },
  { value: "100G", label: "100G" },
  { value: "200G", label: "200G" },
  { value: "400G", label: "400G" },
];
