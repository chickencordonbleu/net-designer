export type NetworkType = "spine-leaf" | "lacp";
export type OversubscriptionRatio = "1:1" | "2:1" | "3:1";
export type PortSpeed = "10G" | "25G" | "40G" | "100G" | "200G" | "400G";

export interface NetworkConfig {
  networkType: NetworkType;
  oversubscriptionRatio: OversubscriptionRatio;
  nicPorts: number;
  portSpeed: PortSpeed;
}

export interface ServerConfig {
  servers: number;
  frontendNetwork: NetworkConfig;
  gpuNetwork: NetworkConfig;
}
