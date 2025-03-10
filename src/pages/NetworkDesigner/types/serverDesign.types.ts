interface Port {
  id: string;
  speed: string;
}

interface ServerNetwork {
  name: string;
  ports: Port[];
}

interface Server {
  id: string;
  networks: ServerNetwork[];
}

export interface LeafSwitch {
  id: string;
  network: string;
  downlinks?: Port[];
  uplinks?: Port[];
  ports?: Port[];
}

interface SpineSwitch {
  id: string;
  network: string;
  downlinks: Port[];
}

export interface NetworkConnection {
  id: string;
  source: string;
  sourcePort: string;
  target: string;
  targetPort: string;
  speed: string;
  network: string;
}

export interface NetworkDesign {
  servers: Server[];
  leafSwitches: LeafSwitch[];
  spineSwitches: SpineSwitch[];
  connections: NetworkConnection[];
}

interface SwitchPort {
  quantity: number;
  speed: string;
}

interface SwitchNetwork {
  type: string;
  switchPorts: SwitchPort[];
}

interface CiscoSwitch {
  name: string;
  networks: SwitchNetwork[];
}

export const CISCO_SWITCH: CiscoSwitch = {
  name: "9336C-FX2",
  networks: [
    {
      type: "spine-leaf",
      switchPorts: [
        {
          quantity: 36,
          speed: "100G",
        },
      ],
    },
  ],
};
