export const NETWORK_TYPES = [
  { value: "spine-leaf", label: "Spine-Leaf" },
  { value: "lacp", label: "LACP" },
];

export const OVERSUBSCRIPTION_RATIOS = [
  { value: "1:1", label: "1:1 (Non-blocking)" },
  { value: "2:1", label: "2:1 (Oversubscribed)" },
  { value: "3:1", label: "3:1 (Oversubscribed)" },
];

export const PORT_SPEEDS = [
  { value: "10G", label: "10G" },
  { value: "25G", label: "25G" },
  { value: "40G", label: "40G" },
  { value: "100G", label: "100G" },
  { value: "200G", label: "200G" },
  { value: "400G", label: "400G" },
];

export const SWITCH_MODELS = [
  { value: "9336C-FX2", label: "Cisco Nexus 9336C-FX2" },
  { value: "93180YC-EX", label: "Cisco Nexus 93180YC-EX" },
  { value: "93180YC-FX", label: "Cisco Nexus 93180YC-FX" },
  { value: "93240YC-FX2", label: "Cisco Nexus 93240YC-FX2" },
  { value: "9364C", label: "Cisco Nexus 9364C" },
];

export const DEFAULT_FORM_VALUES = {
  quantity: 10,
  networks: [
    {
      name: "frontend",
      type: "lacp",
      nicPorts: {
        quantity: 2,
        speed: "25G",
      },
    },
    {
      name: "gpu",
      type: "spine-leaf",
      oversubscription_ratio: "1:1",
      nicPorts: {
        quantity: 4,
        speed: "100G",
      },
    },
  ],
  ciscoSwitches: [
    {
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
    },
  ],
};
