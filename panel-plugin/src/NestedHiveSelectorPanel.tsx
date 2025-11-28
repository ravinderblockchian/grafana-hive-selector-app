// @ts-nocheck
import React, { useMemo, useState } from 'react';
import { PanelProps } from '@grafana/data';
import { NestedHiveSelector } from '../../shared/components/NestedHiveSelector';
import { processTreeData } from '../../shared/utils/treeProcessing';
import { NestedOptions } from '../../shared/types';

export const NestedHiveSelectorPanel: React.FC<PanelProps<NestedOptions>> = ({
  options,
  eventBus,
  width,
  height,
}) => {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [selectedPath, setSelectedPath] = useState<string[]>([]);

  // Process tree data from panel options
  const treeData = useMemo(() => {
    return processTreeData(options.jsonData, options.devicesJson);
  }, [options.jsonData, options.devicesJson]);

  const handleSelectionChange = (value: string, path: string[], nodeValue?: string) => {
    setSelectedValue(value);
    setSelectedPath(path);

    // Update dashboard variable via eventBus
    if (nodeValue !== undefined) {
      eventBus.publish({
        type: "update-dashboard-variable",
        payload: { name: "selected_hive", value: String(nodeValue) },
      });
    }
  };

  const handleClear = () => {
    setSelectedValue(null);
    setSelectedPath([]);
    
    // Clear the dashboard variable
    eventBus.publish({
      type: "update-dashboard-variable",
      payload: { name: "selected_hive", value: "" },
    });
  };

  return (
    <div
      style={{
        width,
        height,
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
      }}
    >
      <NestedHiveSelector
        treeData={treeData}
        labelText="Site/Group"
        selectedValue={selectedValue}
        selectedPath={selectedPath}
        onSelectionChange={handleSelectionChange}
        onClear={handleClear}
        width="350px"
        dropdownPosition="below"
      />
    </div>
  );
};
