import React, { useState, useEffect } from 'react';
import { Maximize2, Server, Network } from 'lucide-react';

const SpineLeafDesigner = () => {
  const [config, setConfig] = useState({
    servers: {
      quantity: 10,
      networks: [
        {
          name: 'frontend',
          type: 'lacp',
          nicPorts: {
            quantity: 2,
            speed: '25G'
          }
        },
        {
          name: 'gpu',
          type: 'spine-leaf',
          oversubscription_ratio: '1:1',
          nicPorts: {
            quantity: 4,
            speed: '100G'
          }
        }
      ]
    },
    ciscoSwitches: [
      {
        name: '9336C-FX2',
        networks: [
          {
            type: 'spine-leaf',
            switchPorts: [
              {
                quantity: 36,
                speed: '100G'
              }
            ]
          }
        ]
      }
    ]
  });

  const [networkDesign, setNetworkDesign] = useState(null);
  const [yamlConfig, setYamlConfig] = useState('');

  // Function to handle input changes
  const handleInputChange = (path, value) => {
    const newConfig = { ...config };
    
    // Parse the path and update the nested property
    const pathArray = path.split('.');
    let current = newConfig;
    
    for (let i = 0; i < pathArray.length - 1; i++) {
      if (pathArray[i].includes('[')) {
        const key = pathArray[i].split('[')[0];
        const index = parseInt(pathArray[i].split('[')[1]);
        current = current[key][index];
      } else {
        current = current[pathArray[i]];
      }
    }
    
    const lastKey = pathArray[pathArray.length - 1];
    if (lastKey.includes('[')) {
      const key = lastKey.split('[')[0];
      const index = parseInt(lastKey.split('[')[1]);
      current[key][index] = value;
    } else {
      current[lastKey] = value;
    }
    
    setConfig(newConfig);
  };

  // Generate network design
  const generateNetworkDesign = () => {
    const design = {
      servers: [],
      leafSwitches: [],
      spineSwitches: [],
      connections: []
    };

    // Create servers
    for (let i = 0; i < config.servers.quantity; i++) {
      design.servers.push({
        id: `server-${i+1}`,
        networks: config.servers.networks.map(network => ({
          name: network.name,
          ports: Array(network.nicPorts.quantity).fill().map((_, j) => ({
            id: `${network.name}-port-${j+1}`,
            speed: network.nicPorts.speed
          }))
        }))
      });
    }

    // For each network type, generate appropriate switch infrastructure
    config.servers.networks.forEach(network => {
      console.log('Processing network:', network);
      if (network.type === 'spine-leaf') {
        // Get the oversubscription ratio from the configuration
        let oversubscriptionRatio = 1; // 1:1 non-blocking as specified in YAML
        if (network.oversubscription_ratio === '2:1') oversubscriptionRatio = 2;
        if (network.oversubscription_ratio === '3:1') oversubscriptionRatio = 3;
        
        // Find the switch model to use (Cisco 9336C-FX2 with 36 ports at 100G)
        const switchModel = config.ciscoSwitches.find(sw => 
          sw.networks.some(net => net.type === 'spine-leaf')
        );
        
        // Get switch port details (36 ports at 100G)
        const switchPortInfo = switchModel?.networks
          .find(net => net.type === 'spine-leaf')
          ?.switchPorts[0];
          
        const totalPortsPerSwitch = switchPortInfo ? switchPortInfo.quantity : 36; // Hardcoded to 36 for 9336C-FX2
        
        // Calculate number of server connections needed for this network
        const totalServerConnections = config.servers.quantity * network.nicPorts.quantity; // 10 servers * 4 ports = 40 connections
        
        // Calculate the number of leaf switches needed
        // Each leaf switch can handle downlinks to servers, but we need to balance with uplinks
        // For 1:1 non-blocking, we can use up to half the ports for downlinks (18 ports) and half for uplinks (18 ports)
        const maxDownlinksPerLeaf = Math.floor(totalPortsPerSwitch / 2); // 18 downlinks max per leaf (1:1 non-blocking)
        const maxUplinksPerLeaf = totalPortsPerSwitch - maxDownlinksPerLeaf; // 18 uplinks max per leaf
        
        // Calculate the number of leaf switches needed to accommodate all server connections
        let numLeafSwitches = Math.ceil(totalServerConnections / maxDownlinksPerLeaf); // 40 / 18 ≈ 2.22 → 3 leaf switches
        
        // Ensure we distribute server connections evenly across leaf switches
        const serversPerLeaf = Math.ceil(totalServerConnections / numLeafSwitches); // ~13-14 servers per leaf
        
        // Recalculate actual downlinks per leaf to ensure we don’t exceed total server connections
        const finalDownlinksPerLeaf = Math.min(maxDownlinksPerLeaf, serversPerLeaf);
        
        // Calculate total uplinks needed from all leaf switches
        // For 1:1 non-blocking, uplinks must match downlinks in capacity
        const totalUplinksNeeded = numLeafSwitches * maxUplinksPerLeaf; // Ensure this is 3 × 18 = 54 for 10 servers

        console.log('GPU Network - Total Server Connections:', totalServerConnections);
        console.log('Number of Leaf Switches:', numLeafSwitches);
        
        // Create leaf switches
        for (let i = 0; i < numLeafSwitches; i++) {
          const serverConnectionsForThisLeaf = (i < numLeafSwitches - 1) 
            ? finalDownlinksPerLeaf 
            : Math.min(finalDownlinksPerLeaf, totalServerConnections - (finalDownlinksPerLeaf * (numLeafSwitches - 1))); // Last leaf gets remaining connections
          
          design.leafSwitches.push({
            id: `${network.name}-leaf-${i+1}`,
            network: network.name,
            downlinks: Array(serverConnectionsForThisLeaf).fill().map((_, j) => ({
              id: `downlink-${j+1}`,
              speed: network.nicPorts.speed
            })),
            uplinks: Array(maxUplinksPerLeaf).fill().map((_, j) => ({
              id: `uplink-${j+1}`,
              speed: network.nicPorts.speed
            }))
          });
        }
        
        console.log('Leaf Switches:', design.leafSwitches.filter(l => l.network === network.name));
        
        console.log('GPU Network - Total Uplinks Needed:', totalUplinksNeeded);
        
        // Calculate the number of spine switches needed
        // Each spine has 36 ports, all used for downlinks (connecting to leaf uplinks)
        // We need to distribute totalUplinksNeeded across spine switches without exceeding 36 ports per spine
        const numSpineSwitches = Math.ceil(totalUplinksNeeded / totalPortsPerSwitch); // 54 / 36 ≈ 1.5 → 2 spine switches
        
        // Ensure minimum 2 spines for redundancy, but use calculated number if higher
        const finalSpineCount = Math.max(2, numSpineSwitches);
        
        // Calculate downlinks per spine (uplinks from leaves)
        const downlinksPerSpine = Math.ceil(totalUplinksNeeded / finalSpineCount); // 54 / 2 = 27 per spine
        
        // Adjust to ensure total spine downlinks match total leaf uplinks
        let remainingConnections = totalUplinksNeeded;
        for (let i = 0; i < finalSpineCount; i++) {
          const thisSpineDownlinks = (i === finalSpineCount - 1) 
            ? remainingConnections 
            : Math.min(downlinksPerSpine, remainingConnections);
          
          remainingConnections -= thisSpineDownlinks;
          
          design.spineSwitches.push({
            id: `${network.name}-spine-${i+1}`,
            network: network.name,
            downlinks: Array(thisSpineDownlinks).fill().map((_, j) => ({
              id: `downlink-${j+1}`,
              speed: network.nicPorts.speed
            }))
          });
        }
        
        console.log('Number of Spine Switches:', finalSpineCount);
        console.log('Spine Switches:', design.spineSwitches.filter(s => s.network === network.name));
        
        // Create connections between servers and leaf switches
        let serverPortsAllocated = 0;
        design.servers.forEach((server, serverIndex) => {
          const networkInfo = server.networks.find(n => n.name === network.name);
          if (networkInfo) {
            networkInfo.ports.forEach((port, portIndex) => {
              const targetLeafIndex = Math.floor(serverPortsAllocated / finalDownlinksPerLeaf);
              if (targetLeafIndex < numLeafSwitches) {
                const targetLeaf = design.leafSwitches.find(leaf => leaf.id === `${network.name}-leaf-${targetLeafIndex+1}`);
                
                if (targetLeaf) {
                  const portOnLeaf = serverPortsAllocated % finalDownlinksPerLeaf;
                  if (portOnLeaf < targetLeaf.downlinks.length) {
                    design.connections.push({
                      id: `conn-server${serverIndex+1}-${network.name}-port${portIndex+1}-to-leaf${targetLeafIndex+1}`,
                      source: `server-${serverIndex+1}`,
                      sourcePort: `${network.name}-port-${portIndex+1}`,
                      target: targetLeaf.id,
                      targetPort: `downlink-${portOnLeaf+1}`,
                      speed: network.nicPorts.speed,
                      network: network.name
                    });
                    serverPortsAllocated++;
                  }
                }
              }
            });
          }
        });
        
        // Create connections between leaf and spine switches
        // Every leaf connects to EVERY spine with equal distribution of uplinks
        design.leafSwitches.forEach((leaf, leafIndex) => {
          if (leaf.network === network.name) {
            design.spineSwitches
              .filter(spine => spine.network === network.name)
              .forEach((spine, spineIndex) => {
                // Calculate how many uplinks per leaf per spine
                const uplinksPerSpine = Math.floor(maxUplinksPerLeaf / finalSpineCount);
                const extraUplinks = maxUplinksPerLeaf % finalSpineCount;
                
                const uplinksToThisSpine = uplinksPerSpine + (spineIndex < extraUplinks ? 1 : 0);
                
                let uplinkIndexStart = 0;
                for (let s = 0; s < spineIndex; s++) {
                  uplinkIndexStart += uplinksPerSpine + (s < extraUplinks ? 1 : 0);
                }
                
                for (let uplinkIndex = 0; uplinkIndex < uplinksToThisSpine; uplinkIndex++) {
                  const globalUplinkIndex = uplinkIndexStart + uplinkIndex;
                  
                  design.connections.push({
                    id: `conn-${leaf.id}-uplink${globalUplinkIndex+1}-to-${spine.id}`,
                    source: leaf.id,
                    sourcePort: `uplink-${globalUplinkIndex+1}`,
                    target: spine.id,
                    targetPort: `downlink-${(leafIndex * uplinksToThisSpine) + uplinkIndex + 1}`,
                    speed: network.nicPorts.speed,
                    network: network.name
                  });
                }
              });
          }
        });
      } else if (network.type === 'lacp') {
        // For LACP networks, create a pair of switches for redundancy
        const lacpSwitch1 = {
          id: `${network.name}-switch-1`,
          network: network.name,
          ports: Array(config.servers.quantity * network.nicPorts.quantity / 2).fill().map((_, j) => ({
            id: `port-${j+1}`,
            speed: network.nicPorts.speed
          }))
        };
        
        const lacpSwitch2 = {
          id: `${network.name}-switch-2`,
          network: network.name,
          ports: Array(config.servers.quantity * network.nicPorts.quantity / 2).fill().map((_, j) => ({
            id: `port-${j+1}`,
            speed: network.nicPorts.speed
          }))
        };
        
        design.leafSwitches.push(lacpSwitch1, lacpSwitch2);
        
        // Create connections between servers and LACP switches
        design.servers.forEach((server, serverIndex) => {
          const networkInfo = server.networks.find(n => n.name === network.name);
          if (networkInfo) {
            networkInfo.ports.forEach((port, portIndex) => {
              const targetSwitch = portIndex % 2 === 0 ? lacpSwitch1 : lacpSwitch2;
              const portOnSwitch = Math.floor(serverIndex + (portIndex / 2));
              
              design.connections.push({
                id: `conn-server${serverIndex+1}-${network.name}-port${portIndex+1}-to-${targetSwitch.id}-port${portOnSwitch+1}`,
                source: `server-${serverIndex+1}`,
                sourcePort: `${network.name}-port-${portIndex+1}`,
                target: targetSwitch.id,
                targetPort: `port-${portOnSwitch+1}`,
                speed: network.nicPorts.speed,
                network: network.name
              });
            });
          }
        });
      }
    });
    console.log('Network Design:', design);
    setNetworkDesign(design);
    generateYamlConfig(design);
  };

  // Function to generate YAML configuration
  const generateYamlConfig = (design) => {
    let yaml = 'servers:\n';
    yaml += `  quantity: ${config.servers.quantity}\n`;
    yaml += '  networks:\n';
    
    config.servers.networks.forEach(network => {
      yaml += `    - name: "${network.name}"\n`;
      yaml += `      type: "${network.type}"\n`;
      if (network.type === 'spine-leaf') {
        yaml += `      oversubscription_ratio: "${network.oversubscription_ratio}"\n`;
      }
      yaml += `      nic-ports:\n`;
      yaml += `        quantity: ${network.nicPorts.quantity}\n`;
      yaml += `        speed: "${network.nicPorts.speed}"\n`;
    });
    
    // Add Cisco switch information
    yaml += '\ncisco-switches:\n';
    config.ciscoSwitches.forEach(switchModel => {
      yaml += `  - name: "${switchModel.name}"\n`;
      yaml += '    networks:\n';
      switchModel.networks.forEach(network => {
        yaml += `      - type: "${network.type}"\n`;
        yaml += '        switch-ports:\n';
        network.switchPorts.forEach(port => {
          yaml += `          - quantity: ${port.quantity}\n`;
          yaml += `            speed: "${port.speed}"\n`;
        });
      });
    });
    
    if (design) {
      yaml += '\nnetwork-design:\n';
      
      // Add leaf switches
      if (design.leafSwitches.length > 0) {
        yaml += '  leaf-switches:\n';
        design.leafSwitches.forEach(leaf => {
          yaml += `    - id: ${leaf.id}\n`;
          yaml += `      model: "9336C-FX2"\n`;
          yaml += `      network: ${leaf.network}\n`;
          if (leaf.downlinks) {
            yaml += `      downlinks: ${leaf.downlinks.length} x ${leaf.downlinks[0].speed}\n`;
            yaml += `      uplinks: ${leaf.uplinks ? leaf.uplinks.length : 0} x ${leaf.uplinks[0].speed}\n`;
          } else if (leaf.ports) {
            yaml += `      ports: ${leaf.ports.length} x ${leaf.ports[0].speed}\n`;
          }
        });
      }
      
      // Add spine switches
      if (design.spineSwitches.length > 0) {
        yaml += '  spine-switches:\n';
        design.spineSwitches.forEach(spine => {
          yaml += `    - id: ${spine.id}\n`;
          yaml += `      model: "9336C-FX2"\n`;
          yaml += `      network: ${spine.network}\n`;
          yaml += `      downlinks: ${spine.downlinks.length} x ${spine.downlinks[0].speed}\n`;
        });
      }
      
      // Add connection summary
      yaml += '\n  connections:\n';
      yaml += `    total: ${design.connections.length}\n`;
      
      // Group by network
      const networkConnections = {};
      design.connections.forEach(conn => {
        if (!networkConnections[conn.network]) {
          networkConnections[conn.network] = 0;
        }
        networkConnections[conn.network]++;
      });
      
      Object.keys(networkConnections).forEach(network => {
        yaml += `    ${network}: ${networkConnections[network]}\n`;
      });
    }
    
    setYamlConfig(yaml);
  };

  // Render the network design as a diagram
  const renderNetworkDiagram = () => {
    if (!networkDesign) return null;
    console.log('Rendering Network Diagram:', networkDesign);

    // Separate spine-leaf networks from LACP networks
    const spineLeafNetworks = config.servers.networks.filter(n => n.type === 'spine-leaf');
    const lacpNetworks = config.servers.networks.filter(n => n.type === 'lacp');
    
    return (
      <div className="mt-8">
        {/* Spine-Leaf Network Diagram */}
        {spineLeafNetworks.map(network => {
          console.log('Rendering Spine-Leaf Network:', network.name, 'Spines:', networkDesign.spineSwitches.filter(s => s.network === network.name), 'Leaves:', networkDesign.leafSwitches.filter(l => l.network === network.name && l.uplinks));
          const spines = networkDesign.spineSwitches.filter(s => s.network === network.name);
          const leaves = networkDesign.leafSwitches.filter(l => l.network === network.name && l.uplinks);
          
          if (spines.length === 0 || leaves.length === 0) {
            console.log('No spines or leaves for network:', network.name);
            return null;
          }
          
          return (
            <div key={`${network.name}-diagram`} className="mb-12 p-4 bg-gray-100 rounded-lg overflow-auto">
              <h3 className="text-lg font-semibold mb-4">{network.name.toUpperCase()} Spine-Leaf Network</h3>
              
              <div className="flex flex-col items-center">
                {/* Spine Layer */}
                <div className="mb-12">
                  <div className="text-center mb-2 font-semibold">Spine Layer</div>
                  <div className="flex justify-center flex-wrap gap-4">
                    {spines.map(spine => (
                      <div key={spine.id} className="flex flex-col items-center">
                        <div className="bg-blue-500 text-white p-2 rounded-md w-48 text-center mb-2">
                          <Network className="inline-block mr-2" size={16} />
                          {spine.id}
                        </div>
                        <div className="text-xs text-gray-600">{spine.downlinks.length} x {spine.downlinks[0].speed} downlinks</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Connection lines between Spine and Leaf */}
                <div className="h-16 relative w-full mb-4">
                  <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                    <div className="w-2/3 border-l-2 border-r-2 border-t-2 border-gray-400 h-full"></div>
                  </div>
                </div>
                
                {/* Leaf Layer */}
                <div className="mb-12">
                  <div className="text-center mb-2 font-semibold">Leaf Layer</div>
                  <div className="flex justify-center flex-wrap gap-4">
                    {leaves.map(leaf => (
                      <div key={leaf.id} className="flex flex-col items-center m-2">
                        <div className="bg-purple-500 text-white p-2 rounded-md w-48 text-center mb-2">
                          <Network className="inline-block mr-2" size={16} />
                          {leaf.id}
                        </div>
                        <div className="text-xs text-gray-600">
                          {leaf.downlinks.length} x downlinks, {leaf.uplinks.length} x uplinks
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Connection lines between Leaf and Servers */}
                <div className="h-16 relative w-full mb-4">
                  <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                    <div className="w-5/6 border-l-2 border-r-2 border-t-2 border-gray-400 h-full"></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* LACP Network Diagram - Separate from Spine-Leaf */}
        {lacpNetworks.map(network => {
          const lacpSwitches = networkDesign.leafSwitches.filter(l => l.network === network.name);
          
          if (lacpSwitches.length === 0) return null;
          
          return (
            <div key={`${network.name}-diagram`} className="mb-12 p-4 bg-gray-100 rounded-lg overflow-auto">
              <h3 className="text-lg font-semibold mb-4">{network.name.toUpperCase()} LACP Network</h3>
              
              <div className="flex flex-col items-center">
                {/* LACP Switch Layer - as a standalone layer */}
                <div className="mb-12">
                  <div className="text-center mb-2 font-semibold">Stacked Switches</div>
                  <div className="flex justify-center space-x-8">
                    {lacpSwitches.map(sw => (
                      <div key={sw.id} className="flex flex-col items-center">
                        <div className="bg-green-500 text-white p-2 rounded-md w-48 text-center mb-2">
                          <Network className="inline-block mr-2" size={16} />
                          {sw.id}
                        </div>
                        <div className="text-xs text-gray-600">{sw.ports?.length || 0} x {sw.ports?.[0]?.speed} ports</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Connection lines between Switches and Servers */}
                <div className="h-16 relative w-full mb-4">
                  <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                    <div className="w-2/3 border-l-2 border-r-2 border-t-2 border-gray-400 h-full"></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Servers Layer - common for all networks */}
        <div className="p-4 bg-gray-100 rounded-lg overflow-auto">
          <div className="text-center mb-2 font-semibold">Servers Layer</div>
          <div className="flex justify-center flex-wrap gap-2">
            {networkDesign.servers.map((server) => (
              <div key={server.id} className="flex flex-col items-center m-1">
                <div className="bg-gray-700 text-white p-2 rounded-md w-32 text-center mb-1">
                  <Server className="inline-block mr-2" size={14} />
                  {server.id}
                </div>
                <div className="text-xs">
                  {server.networks.map(net => (
                    <div key={`${server.id}-${net.name}`} className="text-gray-600">
                      {net.name}: {net.ports.length} x {net.ports[0].speed}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render stats and summary
  const renderNetworkStats = () => {
    if (!networkDesign) return null;
    
    // Calculate total network metrics
    const totalServers = networkDesign.servers.length;
    const totalLeafSwitches = networkDesign.leafSwitches.length;
    const totalSpineSwitches = networkDesign.spineSwitches.length;
    const totalConnections = networkDesign.connections.length;
    
    // Calculate connection metrics by network type and speed
    const connectionsByNetwork = {};
    const connectionsBySpeed = {};
    
    networkDesign.connections.forEach(conn => {
      // By network
      if (!connectionsByNetwork[conn.network]) {
        connectionsByNetwork[conn.network] = 0;
      }
      connectionsByNetwork[conn.network]++;
      
      // By speed
      if (!connectionsBySpeed[conn.speed]) {
        connectionsBySpeed[conn.speed] = 0;
      }
      connectionsBySpeed[conn.speed]++;
    });
    
    return (
      <div className="mt-4 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Network Statistics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-700">Infrastructure</h4>
            <ul className="list-disc list-inside ml-2 text-sm">
              <li>Servers: {totalServers}</li>
              <li>Leaf Switches: {totalLeafSwitches}</li>
              <li>Spine Switches: {totalSpineSwitches}</li>
              <li>Total Connections: {totalConnections}</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700">Connections by Network</h4>
            <ul className="list-disc list-inside ml-2 text-sm">
              {Object.entries(connectionsByNetwork).map(([network, count]) => (
                <li key={network}>{network}: {count} connections</li>
              ))}
            </ul>
            
            <h4 className="font-medium text-gray-700 mt-2">Connections by Speed</h4>
            <ul className="list-disc list-inside ml-2 text-sm">
              {Object.entries(connectionsBySpeed).map(([speed, count]) => (
                <li key={speed}>{speed}: {count} connections</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  // Effect to run initial design generation
  useEffect(() => {
    // Run the network design generation when the component mounts
    generateNetworkDesign();
  }, []);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 flex items-center">
        <Maximize2 className="mr-2" />
        Spine-Leaf Network Designer
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="col-span-1 bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">Configuration</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Servers
            </label>
            <input
              type="number"
              min="1"
              className="w-full p-2 border rounded"
              value={config.servers.quantity}
              onChange={(e) => handleInputChange('servers.quantity', parseInt(e.target.value))}
            />
          </div>
          
          {config.servers.networks.map((network, networkIndex) => (
            <div key={network.name} className="mb-4 p-3 border rounded">
              <h3 className="font-medium mb-2">{network.name} Network</h3>
              
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  className="w-full p-2 border rounded"
                  value={network.type}
                  onChange={(e) => handleInputChange(`servers.networks[${networkIndex}].type`, e.target.value)}
                >
                  <option value="spine-leaf">Spine-Leaf</option>
                  <option value="lacp">LACP</option>
                </select>
              </div>
              
              {network.type === 'spine-leaf' && (
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Oversubscription Ratio
                  </label>
                  <select
                    className="w-full p-2 border rounded"
                    value={network.oversubscription_ratio}
                    onChange={(e) => handleInputChange(`servers.networks[${networkIndex}].oversubscription_ratio`, e.target.value)}
                  >
                    <option value="1:1">1:1 (Non-blocking)</option>
                    <option value="2:1">2:1 (Oversubscription)</option>
                    <option value="3:1">3:1 (Oversubscription)</option>
                  </select>
                </div>
              )}
              
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NIC Ports per Server
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full p-2 border rounded"
                  value={network.nicPorts.quantity}
                  onChange={(e) => handleInputChange(`servers.networks[${networkIndex}].nicPorts.quantity`, parseInt(e.target.value))}
                />
              </div>
              
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Port Speed
                </label>
                <select
                  className="w-full p-2 border rounded"
                  value={network.nicPorts.speed}
                  onChange={(e) => handleInputChange(`servers.networks[${networkIndex}].nicPorts.speed`, e.target.value)}
                >
                  <option value="10G">10G</option>
                  <option value="25G">25G</option>
                  <option value="40G">40G</option>
                  <option value="100G">100G</option>
                  <option value="200G">200G</option>
                  <option value="400G">400G</option>
                </select>
              </div>
            </div>
          ))}
          
          <button
            onClick={generateNetworkDesign}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            Generate Network Design
          </button>
        </div>
        
        <div className="col-span-1 md:col-span-2 bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">YAML Configuration</h2>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto h-96">
            {yamlConfig}
          </pre>
        </div>
      </div>
      
      {networkDesign && renderNetworkDiagram()}
      {networkDesign && renderNetworkStats()}
    </div>
  );
};

export default SpineLeafDesigner;