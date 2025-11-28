// @ts-nocheck
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { PanelProps } from '@grafana/data';
import { useTheme2, Button } from '@grafana/ui';
import { NestedOptions, TreeNode } from './types';
import { SEVERITY_CONFIG, defaultTree } from './module';

export const NestedHiveSelectorPanel: React.FC<PanelProps<NestedOptions>> = ({
  options,
  eventBus,
  width,
  height,
}) => {
  const theme = useTheme2();

  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(true);
  const [expanded, setExpanded] = useState({});
  
  const labelText = "Site/Group";

  const dropdownRef = useRef(null);

  // Convert flat array with parentId into nested tree structure
  const buildTreeFromFlatArray = (flatArray: any[]): TreeNode[] => {
    if (!Array.isArray(flatArray) || flatArray.length === 0) {
      console.error('[BUILD TREE] Empty or invalid array');
      return [];
    }

    // Check if it's a flat array (has parentId property)
    const isFlatArray = flatArray.some(item => item.parentId !== undefined);
    
    if (!isFlatArray) {
      // Already a nested tree structure, return as is
      console.error('[BUILD TREE] Already nested tree, returning as is');
      return flatArray;
    }

    console.error('[BUILD TREE] Building tree from flat array, total items:', flatArray.length);
    console.error('[BUILD TREE] All items:', flatArray.map(item => ({ name: item.name, id: item.id, parentId: item.parentId })));

    // Create a map of all items by id for quick lookup
    const itemsById = new Map();
    flatArray.forEach(item => {
      itemsById.set(item.id, item);
    });

    // Recursive function to build children for a given parentId
    const buildChildren = (parentId: string | null): TreeNode[] => {
      const matchingItems = flatArray.filter(item => {
        if (parentId === null) {
          return item.parentId === null || item.parentId === undefined;
        }
        return item.parentId === parentId;
      });
      
      console.error(`[BUILD TREE] Building children for parentId: ${parentId}, found ${matchingItems.length} items:`, matchingItems.map(i => i.name));
      
      return matchingItems.map(item => {
        const node: any = {
          name: item.name,
          value: item.value || item.id,
          id: item.id, // Keep id for matching with devices
          maxAlarmSeverity: item.maxAlarmSeverity,
        };
        
        console.error(`[BUILD TREE] Processing node: ${item.name} (id: ${item.id}, parentId: ${item.parentId})`);
        
        // Recursively build children
        const children = buildChildren(item.id);
        if (children.length > 0) {
          node.children = children;
          console.error(`[BUILD TREE] Node ${item.name} has ${children.length} children:`, children.map((c: any) => c.name));
        } else {
          console.error(`[BUILD TREE] Node ${item.name} has no children`);
        }
        
        return node;
      });
    };

    // Build tree starting from root nodes (parentId === null)
    const result = buildChildren(null);
    console.error('[BUILD TREE] Final tree structure:', JSON.stringify(result, null, 2));
    console.error('[BUILD TREE] Total root nodes:', result.length);
    
    // Verify all items are included
    const includedIds = new Set();
    const collectIds = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        const nodeAny = node as any;
        if (nodeAny.id) {
          includedIds.add(nodeAny.id);
        }
        if (node.children) {
          collectIds(node.children);
        }
      });
    };
    collectIds(result);
    console.error('[BUILD TREE] Total items included:', includedIds.size, 'out of', flatArray.length);
    const missingItems = flatArray.filter(item => !includedIds.has(item.id));
    if (missingItems.length > 0) {
      console.error('[BUILD TREE] WARNING: Missing items:', missingItems.map(i => ({ name: i.name, id: i.id, parentId: i.parentId })));
    }
    
    return result;
  };

  // Helper function to merge user's tree into defaultTree structure
  // This ensures ALL nodes from defaultTree are preserved, and user's nodes are merged/added
  const mergeUserTreeIntoDefault = (defaultTree: TreeNode[], userTree: TreeNode[]): TreeNode[] => {
    // Create a map of user nodes by name for quick lookup
    const userNodeMap = new Map<string, TreeNode>();
    const buildUserMap = (nodes: TreeNode[], path: string = '') => {
      nodes.forEach(node => {
        const fullPath = path ? `${path}|${node.name}` : node.name;
        userNodeMap.set(fullPath, node);
        if (node.children) {
          buildUserMap(node.children, fullPath);
        }
      });
    };
    buildUserMap(userTree);
    
    // Recursively merge: for each node in defaultTree, check if user has a matching node
    const mergeRecursive = (defaultNodes: TreeNode[], userNodes: TreeNode[], path: string = ''): TreeNode[] => {
      return defaultNodes.map(defaultNode => {
        const nodePath = path ? `${path}|${defaultNode.name}` : defaultNode.name;
        const userNode = userNodeMap.get(nodePath);
        
        const merged: any = { ...defaultNode };
        
        // If user has this node, merge its properties (but keep defaultTree structure)
        if (userNode) {
          // Update properties from user's node
          if (userNode.maxAlarmSeverity !== undefined) {
            merged.maxAlarmSeverity = userNode.maxAlarmSeverity;
          }
          if ((userNode as any).id) {
            merged.id = (userNode as any).id;
          }
          if (userNode.value) {
            merged.value = userNode.value;
          }
        }
        
        // Recursively merge children
        if (merged.children && Array.isArray(merged.children)) {
          merged.children = mergeRecursive(merged.children, userNode?.children || [], nodePath);
        }
        
        return merged;
      });
    };
    
    return mergeRecursive(defaultTree, userTree);
  };

  // Helper function to merge user's JSON with defaultTree to get severity/icon values
  // Only adds maxAlarmSeverity/icon if they don't exist in user's JSON
  // IMPORTANT: Preserves ALL nodes from userTree, never removes nodes
  const mergeWithDefaultTree = (userTree: TreeNode[], defaultTree: TreeNode[]): TreeNode[] => {
    const findInDefault = (name: string, defaultNodes: TreeNode[]): TreeNode | null => {
      for (const node of defaultNodes) {
        if (node.name === name) {
          return node;
        }
        if (node.children) {
          const found = findInDefault(name, node.children);
          if (found) return found;
        }
      }
      return null;
    };

    // Process each node in userTree - preserve ALL nodes
    return userTree.map(userNode => {
      const defaultNode = findInDefault(userNode.name, defaultTree);
      const merged: any = { ...userNode };

      // Only add severity/icon from defaultTree if user's JSON doesn't have it
      if (defaultNode) {
        // Only add maxAlarmSeverity if user's JSON doesn't have it
        if (merged.maxAlarmSeverity === undefined && defaultNode.maxAlarmSeverity !== undefined) {
          merged.maxAlarmSeverity = defaultNode.maxAlarmSeverity;
        }
        // Only add icon if user's JSON doesn't have it
        if (!merged.icon && (defaultNode as any).icon) {
          merged.icon = (defaultNode as any).icon;
        }
      }

      // Recursively merge children - preserve ALL children from userTree
      if (merged.children && Array.isArray(merged.children)) {
        // Preserve empty arrays - nodes with no children should still be displayed
        merged.children = mergeWithDefaultTree(merged.children, defaultNode?.children || []);
      } else if (defaultNode && defaultNode.children && defaultNode.children.length > 0) {
        // If user's node has no children but defaultTree has children, don't add them
        // Only merge properties, not structure
      }

      return merged;
    });
  };

  // Parse tree data - keep original simple structure
  const treeData: TreeNode[] = useMemo(() => {
    try {
      // options comes from Grafana PanelProps - it contains the panel configuration
      // options.jsonData is set from the panel settings (defined in module.ts)
      // When you edit the panel settings and save, Grafana stores that value
      // The defaultValue in module.ts is only used when the panel is first created
      console.error('[OPTIONS DEBUG] Full options object:', options);
      console.error('[OPTIONS DEBUG] options.jsonData (raw string):', options.jsonData);
      
      // Start with defaultTree as the base - this ensures ALL nodes from module.ts are included
      let parsed: TreeNode[] = JSON.parse(JSON.stringify(defaultTree)); // Deep copy of defaultTree
      console.error('[OPTIONS DEBUG] Starting with defaultTree as base:', JSON.stringify(parsed, null, 2));
      
      // Parse user's JSON if provided
      let userJsonData: any = null;
      if (options.jsonData && options.jsonData.trim() !== '') {
        try {
          userJsonData = JSON.parse(options.jsonData);
          console.error('[OPTIONS DEBUG] Parsed user sites/groups JSON:', userJsonData);
        } catch (e) {
          console.error('[OPTIONS DEBUG] Error parsing user JSON:', e);
        }
      }
      
      // Parse devices JSON if provided
      let devicesArray: any[] = [];
      if (options.devicesJson) {
        try {
          devicesArray = JSON.parse(options.devicesJson || '[]');
          console.error('[OPTIONS DEBUG] Parsed devices JSON:', devicesArray);
        } catch (e) {
          console.error('[OPTIONS DEBUG] Error parsing devices JSON:', e);
        }
      }
      
      // If user provided JSON, merge it into the defaultTree structure
      if (userJsonData && Array.isArray(userJsonData) && userJsonData.length > 0) {
        // Convert flat array to nested tree if needed
        let userTree: TreeNode[] = userJsonData;
        if (userJsonData[0].parentId !== undefined) {
          console.error('[OPTIONS DEBUG] Converting user flat array to nested tree...');
          userTree = buildTreeFromFlatArray(userJsonData);
          console.error('[OPTIONS DEBUG] Converted user tree:', JSON.stringify(userTree, null, 2));
        }
        
        // Merge user's tree into defaultTree - this will update existing nodes and add new ones
        parsed = mergeUserTreeIntoDefault(parsed, userTree);
        console.error('[OPTIONS DEBUG] After merging user tree into default:', JSON.stringify(parsed, null, 2));
      }
      
      // Merge devices maxAlarmSeverity into tree nodes by matching id
      // Also add device nodes as children if they have this node as parent
      const mergeDevicesIntoTree = (treeNodes: TreeNode[], devices: any[]): TreeNode[] => {
        return treeNodes.map(node => {
          const merged: any = { ...node };
          
          // Find matching device by id (exact match) - for nodes that are also devices
          const matchingDevice = devices.find(device => device.id === merged.id);
          
          // If device found and has maxAlarmSeverity, use it
          if (matchingDevice && matchingDevice.maxAlarmSeverity !== undefined) {
            merged.maxAlarmSeverity = matchingDevice.maxAlarmSeverity;
            console.error('[MERGE DEVICES] Found device for node:', merged.name, 'id:', merged.id, 'severity:', matchingDevice.maxAlarmSeverity);
          }
          
          // Check if any devices have this node's id as parentId (devices are children of this node)
          const childDevices = devices.filter(device => device.parentId === merged.id);
          
          // Add device nodes as children if they don't already exist
          if (childDevices.length > 0) {
            // Initialize children array if it doesn't exist
            if (!merged.children) {
              merged.children = [];
            }
            
            // Add device nodes that aren't already in children
            childDevices.forEach(device => {
              // Check if this device is already in children (by name or id)
              const existingChild = merged.children.find((child: any) => 
                child.name === device.name || child.id === device.id || child.value === device.id
              );
              
              if (!existingChild) {
                // Add device as a child node
                const deviceNode: any = {
                  name: device.name,
                  value: device.value || device.id,
                  id: device.id,
                  maxAlarmSeverity: device.maxAlarmSeverity,
                };
                merged.children.push(deviceNode);
                console.error('[MERGE DEVICES] Added device as child:', device.name, 'to parent:', merged.name);
              } else {
                // Update existing child with device data
                if (device.maxAlarmSeverity !== undefined) {
                  existingChild.maxAlarmSeverity = device.maxAlarmSeverity;
                }
                if (!existingChild.id) {
                  existingChild.id = device.id;
                }
                if (!existingChild.value) {
                  existingChild.value = device.value || device.id;
                }
              }
            });
            
            // Calculate max severity from child devices if node doesn't have severity
            const childSeverities = childDevices
              .map(d => d.maxAlarmSeverity)
              .filter(s => s !== undefined && s !== null && s >= 0 && s <= 5);
            if (childSeverities.length > 0) {
              const maxChildSeverity = Math.max(...childSeverities);
              // Only set if node doesn't already have severity
              if (merged.maxAlarmSeverity === undefined) {
                merged.maxAlarmSeverity = maxChildSeverity;
                console.error('[MERGE DEVICES] Calculated parent severity from child devices:', merged.name, 'severity:', maxChildSeverity);
              }
            }
          }
          
          // Recursively merge children
          if (merged.children && merged.children.length > 0) {
            merged.children = mergeDevicesIntoTree(merged.children, devices);
          }
          
          return merged;
        });
      };
      
      // Merge devices into tree
      if (devicesArray.length > 0) {
        parsed = mergeDevicesIntoTree(parsed, devicesArray);
        console.error('[OPTIONS DEBUG] After merging devices:', JSON.stringify(parsed, null, 2));
      }
      
      // Restore icon references from SEVERITY_CONFIG if icon property is missing
      const restoreIcons = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.map(node => {
          const restored: any = { ...node };
          
          // Normalize maxAlarmSeverity FIRST - handle string numbers, null, undefined
          if (restored.maxAlarmSeverity !== undefined && restored.maxAlarmSeverity !== null) {
            const severityNum = typeof restored.maxAlarmSeverity === 'string' 
              ? parseInt(restored.maxAlarmSeverity, 10) 
              : Number(restored.maxAlarmSeverity);
            
            if (!isNaN(severityNum) && severityNum >= 0 && severityNum <= 5) {
              restored.maxAlarmSeverity = severityNum;
            } else {
              restored.maxAlarmSeverity = undefined;
            }
          }
          
          // First, recursively process children to ensure they have icons
          if (restored.children && restored.children.length > 0) {
            restored.children = restoreIcons(restored.children);
            // Don't calculate parent severity from children - only use explicit maxAlarmSeverity from JSON
          }
          // Don't assign default severity - only use what's explicitly in the JSON
          
          // Only set icon if severity exists (don't assign default)
          if (restored.maxAlarmSeverity !== undefined && restored.maxAlarmSeverity !== null) {
            const config = SEVERITY_CONFIG[restored.maxAlarmSeverity as keyof typeof SEVERITY_CONFIG];
            if (config && config.icon) {
              // Set icon from config only if severity exists
              restored.icon = config.icon;
            }
          }
          
          return restored;
        });
      };
      
      const result = restoreIcons(parsed);
      
      // Debug: Log treeData with icon information
      console.error('[TREE DATA] Parsed and restored tree:', JSON.stringify(result, null, 2));
      const logNodeIcons = (nodes: TreeNode[], level = 0) => {
        nodes.forEach(node => {
          const nodeAny = node as any;
          const indent = '  '.repeat(level);
          console.error(`${indent}[NODE] ${node.name}:`, {
            maxAlarmSeverity: node.maxAlarmSeverity,
            hasIcon: !!nodeAny.icon,
            icon: nodeAny.icon,
            value: node.value,
            id: nodeAny.id,
            hasChildren: !!(node.children && node.children.length > 0),
            childrenCount: node.children ? node.children.length : 0,
          });
          if (node.children) {
            logNodeIcons(node.children, level + 1);
          }
        });
      };
      logNodeIcons(result);
      console.error('[TREE DATA] Total root nodes:', result.length);
      
      // Count total nodes in tree
      const countAllNodes = (nodes: TreeNode[]): number => {
        let count = nodes.length;
        nodes.forEach(node => {
          if (node.children) {
            count += countAllNodes(node.children);
          }
        });
        return count;
      };
      console.error('[TREE DATA] Total nodes in tree:', countAllNodes(result));
      
      return result;
    } catch (e) {
      console.error('Error parsing tree data:', e);
      return [];
    }
  }, [options.jsonData, options.devicesJson]);

  // Find the selected node from treeData to get its icon
  const findSelectedNode = (nodes: TreeNode[], path: string[]): TreeNode | null => {
    if (path.length === 0) return null;
    
    for (const node of nodes) {
      if (node.name === path[0]) {
        if (path.length === 1) {
          return node; // Found the selected node
        }
        if (node.children) {
          return findSelectedNode(node.children, path.slice(1));
        }
      }
    }
    return null;
  };

  const selectedNode = useMemo(() => {
    if (selectedPath.length === 0) return null;
    return findSelectedNode(treeData, selectedPath);
  }, [selectedPath, treeData]);

  // --------- Close dropdown if clicked outside ----------
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --------- Auto-expand parents when dropdown opens (only if something is selected) ----------
  useEffect(() => {
    if (!dropdownOpen || selectedPath.length === 0) return;

    const newExpanded = {};
    // Expand all parent paths up to the selected item
    for (let i = 0; i < selectedPath.length; i++) {
      const key = selectedPath.slice(0, i + 1).join("|");
      newExpanded[key] = true;
    }

    setExpanded(prev => ({ ...prev, ...newExpanded }));
  }, [dropdownOpen, selectedPath]);

  // Get severity config
  const getSeverityConfig = (severity: number | undefined | null) => {
    // Check if severity is valid (including 0, which is valid)
    if (severity === undefined || severity === null || severity < 0 || severity > 5) {
      return null;
    }
    return SEVERITY_CONFIG[severity as keyof typeof SEVERITY_CONFIG] || null;
  };

  // Render severity icon
  const renderSeverityIcon = (severity: number | undefined, nodeIcon?: string) => {
    // Determine which icon to use
    let iconUrl: string | null = null;
    
    // First try to use icon from node if provided (as string URL)
    if (nodeIcon && typeof nodeIcon === 'string' && nodeIcon.trim() !== '') {
      iconUrl = nodeIcon;
      console.error('[ICON RENDER] Using node icon:', iconUrl, 'for severity:', severity);
    } else {
      // Fallback to severity config
      const config = getSeverityConfig(severity);
      if (config && config.icon) {
        iconUrl = config.icon;
        console.error('[ICON RENDER] Using severity config icon:', iconUrl, 'for severity:', severity);
      } else {
        console.error('[ICON RENDER] No icon found - severity:', severity, 'nodeIcon:', nodeIcon);
      }
    }
    
    // If no icon URL found, return null
    if (!iconUrl) {
      return null;
    }

    return (
      <img 
        src={iconUrl} 
        alt="severity icon"
        style={{ 
          width: 16, 
          height: 16,
          marginRight: '8px',
          flexShrink: 0,
          display: 'inline-block',
          verticalAlign: 'middle',
        }} 
        onLoad={() => {
          // Icon loaded successfully - log to console (will show in dev mode)
          if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            console.error('[ICON LOADED]', iconUrl);
          }
        }}
        onError={(e) => {
          console.error('[ICON ERROR] ❌ Failed to load icon from:', iconUrl);
          console.error('[ICON ERROR] Image src:', e.currentTarget.src);
          // Show a visible placeholder on error so we know the function is being called
          e.currentTarget.style.border = '2px solid red';
          e.currentTarget.style.backgroundColor = '#ffcccc';
          e.currentTarget.alt = 'ICON ERROR';
        }}
      />
    );
  };

  // Render severity badge
  const renderSeverityBadge = (severity: number | undefined) => {
    const config = getSeverityConfig(severity);
    if (!config) return null;

    return (
      <span
        style={{
          fontSize: '11px',
          color: config.color,
          fontWeight: 500,
          marginLeft: 'auto',
          padding: '2px 6px',
          borderRadius: '3px',
          backgroundColor: `${config.color}20`,
        }}
      >
        {config.label}
      </span>
    );
  };

  // --------- Recursive renderer ----------
  const renderTree = (nodes: TreeNode[], path: string[] = [], level = 0) => {
    if (!nodes || nodes.length === 0) {
      console.error('[RENDER TREE] No nodes to render at level', level, 'path:', path);
      return null;
    }
    
    console.error(`[RENDER TREE] Rendering ${nodes.length} nodes at level ${level}, path:`, path);
    
    return nodes.map((node, index) => {
      const nodePath = [...path, node.name];
      const key = nodePath.join("|");
      const isParent = node.children && node.children.length > 0;
      const isExpanded = expanded[key] || false;
      const isLeaf = !isParent;
      const severityConfig = getSeverityConfig(node.maxAlarmSeverity);
      
      console.error(`[RENDER TREE] Rendering node ${index + 1}/${nodes.length}: ${node.name} (isParent: ${isParent}, children: ${node.children ? node.children.length : 0})`);
      
      return (
        <div key={key}>
          <div
            style={{
              padding: "8px 12px",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              paddingLeft: `${level * 20 + 12}px`,
              backgroundColor: selectedPath.join("|") === key ? theme.colors.action.selected : 'transparent',
              minHeight: '32px',
            }}
            onMouseEnter={(e) => {
              if (selectedPath.join("|") !== key) {
                e.currentTarget.style.backgroundColor = theme.colors.action.hover;
              }
            }}
            onMouseLeave={(e) => {
              if (selectedPath.join("|") !== key) {
                e.currentTarget.style.backgroundColor = 'transparent';
              } else {
                e.currentTarget.style.backgroundColor = theme.colors.action.selected;
              }
            }}
            onClick={(e) => {
              e.stopPropagation();

              if (isParent) {
                // Toggle expand/collapse for parent groups - don't close dropdown
                setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
                return;
              }

              // Leaf node selection - close dropdown and update variable
              setSelectedValue(node.name);
              setSelectedPath(nodePath);
              setDropdownOpen(false);

              if (node.value !== undefined) {
      eventBus.publish({
                  type: "update-dashboard-variable",
                  payload: { name: "selected_hive", value: String(node.value) },
      });
    }
            }}
          >
            {/* Arrow indicator for parents */}
            {isParent ? (
              <span
                style={{
                  marginRight: 10,
                  fontSize: "10px",
                  userSelect: "none",
                  width: 14,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: theme.colors.text.secondary,
                }}
              >
                {isExpanded ? "▼" : "▶"}
              </span>
            ) : (
              <span style={{ width: 24, marginRight: 0, display: "inline-block" }}></span>
            )}

            {/* Severity Icon */}
            {(() => {
              const nodeWithIcon = node as any;
              const hasSeverity = node.maxAlarmSeverity !== undefined && node.maxAlarmSeverity !== null;
              const hasIcon = nodeWithIcon.icon && typeof nodeWithIcon.icon === 'string';
              
              return renderSeverityIcon(node.maxAlarmSeverity, nodeWithIcon.icon);
            })()}

            {/* Node Name */}
            <span style={{ 
              fontSize: 14, 
              color: theme.colors.text.primary,
              lineHeight: '1.5',
              flex: 1,
            }}>
              {node.name}
            </span>

            {/* Severity Badge */}
            {renderSeverityBadge(node.maxAlarmSeverity)}
          </div>

          {/* Render children if parent is expanded */}
          {isParent && isExpanded && (
            <div>{renderTree(node.children, nodePath, level + 1)}</div>
          )}
        </div>
      );
    }); 
  };

  return (
    <div
      style={{
        width,
        height,
        padding: 12,
        position: "relative",
        overflow: "visible",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}
      ref={dropdownRef}
    >
      <div style={{ position: 'relative', display: 'inline-block', width: '350px' }}>
        <div
        style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            background: theme.colors.background.secondary,
            border: `1px solid ${theme.colors.border.medium}`,
            borderRadius: '4px',
            minHeight: '32px',
            paddingRight: selectedPath.length > 0 ? '32px' : '12px',
            width: '100%',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = theme.colors.border.strong;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = theme.colors.border.medium;
          }}
        >
          <span style={{ 
            fontSize: '14px', 
          color: theme.colors.text.primary,
            fontWeight: 500,
            backgroundColor: '#d0d0d0',
            padding: '4px 8px',
            borderRadius: '3px',
            marginRight: '8px',
          }}>
            {labelText} |
          </span>
          {selectedValue && (
            <span style={{ 
          fontSize: '14px',
              color: theme.colors.text.primary,
              flex: 1,
              marginRight: selectedPath.length > 0 ? '12px' : '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              {selectedNode && (selectedNode as any).icon && (
                <img 
                  src={(selectedNode as any).icon} 
                  alt="severity icon"
                  style={{ 
                    width: 16, 
                    height: 16,
                    flexShrink: 0,
                    display: 'block',
        }}
      />
              )}
              {selectedValue}
            </span>
          )}
          {!selectedValue && (
            <span style={{ 
              fontSize: '12px', 
              color: theme.colors.text.secondary,
              marginLeft: 'auto',
            }}>
              ▼
            </span>
          )}
          {selectedValue && (
            <span style={{ 
              fontSize: '12px', 
              color: theme.colors.text.secondary,
              marginLeft: 'auto',
              marginRight: '24px',
            }}>
              ▼
            </span>
          )}
        </div>
        {selectedPath.length > 0 && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              setSelectedValue(null);
              setSelectedPath([]);
              setExpanded({});
              setDropdownOpen(false);
              // Clear the dashboard variable
              eventBus.publish({
                type: "update-dashboard-variable",
                payload: { name: "selected_hive", value: "" },
              });
            }}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
              fontSize: '18px',
              color: theme.colors.text.secondary,
              padding: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '18px',
              height: '18px',
              borderRadius: '2px',
              zIndex: 2,
              lineHeight: '1',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.action.hover;
              e.currentTarget.style.color = theme.colors.text.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = theme.colors.text.secondary;
            }}
            title="Clear selection"
          >
            ×
          </span>
        )}
      </div>

      {dropdownOpen && (
        <div
          style={{
            position: "absolute",
            top: 55,
            left: 12,
            width: '350px',
            maxHeight: 450,
            overflowY: "auto",
            background: theme.colors.background.secondary,
            border: `1px solid ${theme.colors.border.medium}`,
            borderRadius: 4,
            padding: "4px 0",
            boxShadow: theme.shadows.z3,
            zIndex: 9999,
          }}
        >
          {treeData.length === 0 ? (
            <div style={{ padding: '12px', color: theme.colors.text.secondary }}>
              No tree data available. Please check console for errors.
            </div>
          ) : (
            <>
              {console.error('[RENDER] About to render tree with', treeData.length, 'root nodes')}
              {renderTree(treeData)}
            </>
          )}
        </div>
      )}
    </div>
  );
};
