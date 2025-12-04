// @ts-nocheck
import { createRoot, Root } from 'react-dom/client';
import React, { useState } from 'react';
import { NestedHiveSelector } from '../../shared/components/NestedHiveSelector';
import { TreeNode } from '../../shared/types';
import { getDashboardSrv } from '@grafana/runtime';

let reactRoot: Root | null = null;
let container: HTMLElement | null = null;

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

export function injectControlBarDropdown(treeData: TreeNode[]) {
  // Remove existing if any
  removeControlBarDropdown();

  const timePicker = document.querySelector('[data-testid="time-picker"]') || 
                     document.querySelector('[data-testid*="time"]') ||
                     document.querySelector('button[aria-label*="time"]') ||
                     document.querySelector('button[aria-label*="Time"]');
  
  if (!timePicker || !timePicker.parentElement) {
    // Retry after a short delay if time picker not found
    setTimeout(() => injectControlBarDropdown(treeData), 200);
    return;
  }

  // Create wrapper
  const wrapper = document.createElement('div');
  wrapper.id = 'hive-selector-wrapper-panel';
  wrapper.setAttribute('data-hive-selector-wrapper-panel', 'true');
  wrapper.style.cssText = 'display: inline-flex; align-items: center; margin-right: 16px;';

  // Create dropdown container
  container = document.createElement('div');
  container.id = 'hive-selector-mount-panel';
  container.setAttribute('data-hive-selector-panel', 'true');
  container.style.marginRight = '16px';
  container.style.display = 'inline-flex';
  container.style.alignItems = 'center';
  container.style.width = '350px';
  container.style.height = '32px';

  wrapper.appendChild(container);

  // Insert wrapper before time picker
  timePicker.parentElement.insertBefore(wrapper, timePicker);

  // Load React component with provided tree data
  try {
    reactRoot = createRoot(container);
    reactRoot.render(React.createElement(ControlBarSelector, { treeData: treeData }));
  } catch (error) {
    console.error('[Hive Selector] Error injecting control bar dropdown:', error);
  }
}

export function removeControlBarDropdown() {
  const wrapper = document.getElementById('hive-selector-wrapper-panel');
  if (wrapper) {
    // Cleanup React root
    if (reactRoot) {
      try {
        reactRoot.unmount();
      } catch (error) {
        // Ignore unmount errors
      }
      reactRoot = null;
    }
    wrapper.remove();
    container = null;
  }
}

