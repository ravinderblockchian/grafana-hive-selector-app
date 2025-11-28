// @ts-nocheck

import { PanelPlugin } from '@grafana/data';
import { NestedHiveSelectorPanel } from './NestedHiveSelectorPanel';
import { NestedOptions, TreeNode } from './types';

// Import SVG icons - webpack will handle the paths
import infoIcon from './img/icons/info.svg';
import normalIcon from './img/icons/normal.svg';
import warningIcon from './img/icons/warning.svg';
import minorIcon from './img/icons/minor.svg';
import majorIcon from './img/icons/major.svg';
import criticalIcon from './img/icons/critical.svg';

// Severity configuration with SVG icons
export const SEVERITY_CONFIG = {
  0: { 
    label: 'Info', 
    color: '#5794F2', 
    icon: infoIcon
  },
  1: { 
    label: 'Normal', 
    color: '#73BF69', 
    icon: normalIcon
  },
  2: { 
    label: 'Warning', 
    color: '#FADE2A', 
    icon: warningIcon
  },
  3: { 
    label: 'Minor', 
    color: '#F79520', 
    icon: minorIcon
  },
  4: { 
    label: 'Major', 
    color: '#E02F44', 
    icon: majorIcon
  },
  5: { 
    label: 'Critical', 
    color: '#C4162A', 
    icon: criticalIcon
  },
};

// Icon paths are initialized - webpack resolves these to URLs

// Helper function to create defaultTree with icon URLs as strings
// This matches the actual JSON structure from sites/groups and devices data
const createDefaultTree = (): TreeNode[] => {
  return [
    {
      name: 'All Site Groups',
      children: [
        {
          name: 'Eastern Region',
          children: [],
        },
        {
          name: 'Huzaifa',
          children: [
            {
              name: 'Hive X',
              maxAlarmSeverity: 5, // From devices JSON
              icon: String(criticalIcon),
              children: [
                { name: 'Hive 117', value: '117', maxAlarmSeverity: 5, icon: String(criticalIcon) },
                { name: 'Hive 120', value: '120', maxAlarmSeverity: 5, icon: String(criticalIcon) },
                { name: 'Hive 114', value: '114', maxAlarmSeverity: 1, icon: String(normalIcon) },
              ],
            },
            {
              name: 'Hive Y',
              // No maxAlarmSeverity in devices JSON for Hive Y itself, only for its children
              children: [
                { name: 'Hive 112', value: '112', maxAlarmSeverity: 2, icon: String(warningIcon) },
                { name: 'Hive 115', value: '115', maxAlarmSeverity: 5, icon: String(criticalIcon) },
                { name: 'Hive 118', value: '118', maxAlarmSeverity: 4, icon: String(majorIcon) },
              ],
            },
            {
              name: 'Hive Z',
              // No maxAlarmSeverity in devices JSON for Hive Z itself, only for its children
              children: [
                { name: 'Hive 111', value: '111', maxAlarmSeverity: 3, icon: String(minorIcon) },
                { name: 'Hive 116', value: '116', maxAlarmSeverity: 4, icon: String(majorIcon) },
                { name: 'Hive 119', value: '119', maxAlarmSeverity: 4, icon: String(majorIcon) },
                { name: 'Hive 113', value: '113', maxAlarmSeverity: 4, icon: String(majorIcon) },
              ],
            },
          ],
        },
        {
          name: 'Northern Region',
          children: [],
        },
        {
          name: 'Southern Region',
          children: [],
        },
        {
          name: 'Western Region',
          children: [
            {
              name: 'Washington State',
              children: [],
            },
          ],
        },
      ],
    },
  ];
};

// Helper function to add default severity/icon to nodes that don't have them
const addDefaultSeverityToTree = (tree: TreeNode[]): TreeNode[] => {
  return tree.map(node => {
    const nodeAny: any = { ...node };
    
    // If node has children but no severity, calculate max severity from children
    if (nodeAny.children && nodeAny.children.length > 0) {
      const childrenWithSeverity = addDefaultSeverityToTree(nodeAny.children);
      const maxChildSeverity = Math.max(
        ...childrenWithSeverity.map((child: any) => child.maxAlarmSeverity ?? -1),
        -1
      );
      
      // If no children have severity, assign default severity 1 (Normal)
      if (maxChildSeverity === -1) {
        nodeAny.maxAlarmSeverity = 1;
        nodeAny.icon = String(normalIcon);
      } else {
        nodeAny.maxAlarmSeverity = maxChildSeverity;
        const config = SEVERITY_CONFIG[maxChildSeverity as keyof typeof SEVERITY_CONFIG];
        if (config) {
          nodeAny.icon = String(config.icon);
        }
      }
      
      nodeAny.children = childrenWithSeverity;
    } else {
      // Leaf node without severity - assign default severity 1 (Normal)
      if (nodeAny.maxAlarmSeverity === undefined) {
        nodeAny.maxAlarmSeverity = 1;
        nodeAny.icon = String(normalIcon);
      } else if (!nodeAny.icon) {
        // Has severity but no icon - restore from config
        const config = SEVERITY_CONFIG[nodeAny.maxAlarmSeverity as keyof typeof SEVERITY_CONFIG];
        if (config) {
          nodeAny.icon = String(config.icon);
        }
      }
    }
    
    return nodeAny;
  });
};

export const defaultTree = createDefaultTree();

export const plugin = new PanelPlugin<NestedOptions>(NestedHiveSelectorPanel)
  .setNoPadding()
  .setPanelOptions((builder) => {
    builder.addTextInput({
      path: 'jsonData',
      name: 'Tree JSON (edit & save panel to apply)',
      description: 'Paste your tree structure here. Can be nested tree OR flat array with parentId. Add optional "maxAlarmSeverity" (0-5) to nodes for icons/colors.',
      settings: {
        useTextarea: true,
        rows: 20,
      },
      defaultValue: JSON.stringify(defaultTree, null, 2),
    });
    builder.addTextInput({
      path: 'devicesJson',
      name: 'Devices JSON (optional - for maxAlarmSeverity values)',
      description: 'Paste devices array with maxAlarmSeverity values. These will be merged into the tree by matching id/name.',
      settings: {
        useTextarea: true,
        rows: 15,
      },
      defaultValue: '',
    });
  });