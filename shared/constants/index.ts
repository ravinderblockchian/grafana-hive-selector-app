// @ts-nocheck

// Import SVG icons - webpack will handle the paths
import infoIcon from '../img/icons/info.svg';
import normalIcon from '../img/icons/normal.svg';
import warningIcon from '../img/icons/warning.svg';
import minorIcon from '../img/icons/minor.svg';
import majorIcon from '../img/icons/major.svg';
import criticalIcon from '../img/icons/critical.svg';

import { TreeNode } from '../types';

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

// Helper function to create defaultTree with icon URLs as strings
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
              maxAlarmSeverity: 5,
              icon: String(criticalIcon),
              children: [
                { name: 'Hive 117', value: '117', maxAlarmSeverity: 5, icon: String(criticalIcon) },
                { name: 'Hive 120', value: '120', maxAlarmSeverity: 5, icon: String(criticalIcon) },
                { name: 'Hive 114', value: '114', maxAlarmSeverity: 1, icon: String(normalIcon) },
              ],
            },
            {
              name: 'Hive Y',
              children: [
                { name: 'Hive 112', value: '112', maxAlarmSeverity: 2, icon: String(warningIcon) },
                { name: 'Hive 115', value: '115', maxAlarmSeverity: 5, icon: String(criticalIcon) },
                { name: 'Hive 118', value: '118', maxAlarmSeverity: 4, icon: String(majorIcon) },
              ],
            },
            {
              name: 'Hive Z',
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

export const defaultTree = createDefaultTree();

