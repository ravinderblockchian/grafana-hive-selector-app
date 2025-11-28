export interface TreeNode {
  name: string;
  value?: string;
  maxAlarmSeverity?: number; // 0-5, optional severity for icons/colors
  children?: TreeNode[];
}

export interface NestedOptions {
  jsonData: string; // JSON string of TreeNode[] or flat array with parentId - supports optional maxAlarmSeverity field
  devicesJson?: string; // Optional JSON string of devices array with maxAlarmSeverity values
}

