// @ts-nocheck
import { createRoot } from 'react-dom/client';
import React, { useState } from 'react';
import { NestedHiveSelector } from '../../shared/components/NestedHiveSelector';
import { processTreeData } from '../../shared/utils/treeProcessing';
import { TreeNode } from '../../shared/types';
import { getDashboardSrv } from '@grafana/runtime';

const ControlBarSelector: React.FC<{ treeData: TreeNode[] }> = ({ treeData }) => {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [selectedPath, setSelectedPath] = useState<string[]>([]);

  const updateDashboardVariable = (name: string, value: string) => {
    try {
      const dashboard = getDashboardSrv().getCurrent();
      if (dashboard) {
        const templateVar = dashboard.templateVars?.find((v: any) => v.name === name);
        if (templateVar) {
          templateVar.current = { value: value, text: value };
          dashboard.templateVars = dashboard.templateVars || [];
        }
        dashboard.refresh();
      }
    } catch (error) {
      // Silent fail - dashboard variable update is optional
    }
  };

  return React.createElement(NestedHiveSelector, {
    treeData: treeData,
    labelText: "Site/Group",
    selectedValue: selectedValue,
    selectedPath: selectedPath,
    onSelectionChange: (value: string, path: string[], nodeValue?: string) => {
      setSelectedValue(value);
      setSelectedPath(path);
      updateDashboardVariable('selected_hive', nodeValue || value);
    },
    onClear: () => {
      setSelectedValue(null);
      setSelectedPath([]);
      updateDashboardVariable('selected_hive', '');
    },
    width: "350px",
    dropdownPosition: "below" as const
  });
};

(window as any).__HIVE_SELECTOR_INJECT_REACT__ = (container: HTMLElement) => {
  if (!container) {
    return;
  }
  
  try {
    const data = processTreeData();
    const reactRoot = createRoot(container);
    reactRoot.render(React.createElement(ControlBarSelector, { treeData: data }));
  } catch (error) {
    // Silent fail - fallback dropdown will be used
  }
};
