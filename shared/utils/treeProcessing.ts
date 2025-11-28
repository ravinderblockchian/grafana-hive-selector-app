// @ts-nocheck
import { TreeNode } from '../types';
import { SEVERITY_CONFIG, defaultTree } from '../constants';

// Convert flat array with parentId into nested tree structure
export const buildTreeFromFlatArray = (flatArray: any[]): TreeNode[] => {
  if (!Array.isArray(flatArray) || flatArray.length === 0) {
    console.error('[BUILD TREE] Empty or invalid array');
    return [];
  }

  // Check if it's a flat array (has parentId property)
  const isFlatArray = flatArray.some(item => item.parentId !== undefined);
  
  if (!isFlatArray) {
    // Already a nested tree structure, return as is
    return flatArray;
  }

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
    
    return matchingItems.map(item => {
      const node: any = {
        name: item.name,
        value: item.value || item.id,
        id: item.id,
        maxAlarmSeverity: item.maxAlarmSeverity,
      };
      
      // Recursively build children
      const children = buildChildren(item.id);
      if (children.length > 0) {
        node.children = children;
      }
      
      return node;
    });
  };

  // Build tree starting from root nodes (parentId === null)
  return buildChildren(null);
};

// Helper function to merge user's tree into defaultTree structure
export const mergeUserTreeIntoDefault = (defaultTree: TreeNode[], userTree: TreeNode[]): TreeNode[] => {
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
  
  const mergeRecursive = (defaultNodes: TreeNode[], userNodes: TreeNode[], path: string = ''): TreeNode[] => {
    return defaultNodes.map(defaultNode => {
      const nodePath = path ? `${path}|${defaultNode.name}` : defaultNode.name;
      const userNode = userNodeMap.get(nodePath);
      
      const merged: any = { ...defaultNode };
      
      if (userNode) {
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
      
      if (merged.children && Array.isArray(merged.children)) {
        merged.children = mergeRecursive(merged.children, userNode?.children || [], nodePath);
      }
      
      return merged;
    });
  };
  
  return mergeRecursive(defaultTree, userTree);
};

// Merge devices maxAlarmSeverity into tree nodes
export const mergeDevicesIntoTree = (treeNodes: TreeNode[], devices: any[]): TreeNode[] => {
  return treeNodes.map(node => {
    const merged: any = { ...node };
    
    const matchingDevice = devices.find(device => device.id === merged.id);
    if (matchingDevice && matchingDevice.maxAlarmSeverity !== undefined) {
      merged.maxAlarmSeverity = matchingDevice.maxAlarmSeverity;
    }
    
    const childDevices = devices.filter(device => device.parentId === merged.id);
    if (childDevices.length > 0) {
      if (!merged.children) {
        merged.children = [];
      }
      
      childDevices.forEach(device => {
        const existingChild = merged.children.find((child: any) => 
          child.name === device.name || child.id === device.id || child.value === device.id
        );
        
        if (!existingChild) {
          const deviceNode: any = {
            name: device.name,
            value: device.value || device.id,
            id: device.id,
            maxAlarmSeverity: device.maxAlarmSeverity,
          };
          merged.children.push(deviceNode);
        } else {
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
      
      const childSeverities = childDevices
        .map(d => d.maxAlarmSeverity)
        .filter(s => s !== undefined && s !== null && s >= 0 && s <= 5);
      if (childSeverities.length > 0) {
        const maxChildSeverity = Math.max(...childSeverities);
        if (merged.maxAlarmSeverity === undefined) {
          merged.maxAlarmSeverity = maxChildSeverity;
        }
      }
    }
    
    if (merged.children && merged.children.length > 0) {
      merged.children = mergeDevicesIntoTree(merged.children, devices);
    }
    
    return merged;
  });
};

// Restore icon references from SEVERITY_CONFIG
export const restoreIcons = (nodes: TreeNode[]): TreeNode[] => {
  return nodes.map(node => {
    const restored: any = { ...node };
    
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
    
    if (restored.children && restored.children.length > 0) {
      restored.children = restoreIcons(restored.children);
    }
    
    if (restored.maxAlarmSeverity !== undefined && restored.maxAlarmSeverity !== null) {
      const config = SEVERITY_CONFIG[restored.maxAlarmSeverity as keyof typeof SEVERITY_CONFIG];
      if (config && config.icon) {
        restored.icon = config.icon;
      }
    }
    
    return restored;
  });
};

// Process tree data from JSON strings
export const processTreeData = (jsonData?: string, devicesJson?: string): TreeNode[] => {
  try {
    let parsed: TreeNode[] = JSON.parse(JSON.stringify(defaultTree));
    
    let userJsonData: any = null;
    if (jsonData && jsonData.trim() !== '') {
      try {
        userJsonData = JSON.parse(jsonData);
      } catch (e) {
        console.error('[TREE PROCESSING] Error parsing user JSON:', e);
      }
    }
    
    let devicesArray: any[] = [];
    if (devicesJson) {
      try {
        devicesArray = JSON.parse(devicesJson || '[]');
      } catch (e) {
        console.error('[TREE PROCESSING] Error parsing devices JSON:', e);
      }
    }
    
    if (userJsonData && Array.isArray(userJsonData) && userJsonData.length > 0) {
      let userTree: TreeNode[] = userJsonData;
      if (userJsonData[0].parentId !== undefined) {
        userTree = buildTreeFromFlatArray(userJsonData);
      }
      parsed = mergeUserTreeIntoDefault(parsed, userTree);
    }
    
    if (devicesArray.length > 0) {
      parsed = mergeDevicesIntoTree(parsed, devicesArray);
    }
    
    return restoreIcons(parsed);
  } catch (e) {
    console.error('[TREE PROCESSING] Error processing tree data:', e);
    return [];
  }
};

