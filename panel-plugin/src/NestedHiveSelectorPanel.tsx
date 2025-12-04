// @ts-nocheck
import React, { useMemo, useEffect } from 'react';
import { PanelProps } from '@grafana/data';
import { processTreeData } from '../../shared/utils/treeProcessing';
import { NestedOptions } from '../../shared/types';
import { injectControlBarDropdown, removeControlBarDropdown } from './controlBarInjector';

export const NestedHiveSelectorPanel: React.FC<PanelProps<NestedOptions>> = ({
  options,
  eventBus,
  width,
  height,
}) => {
  // Process tree data from panel options (for control bar dropdown)
  const treeData = useMemo(() => {
    return processTreeData(options.jsonData, options.devicesJson);
  }, [options.jsonData, options.devicesJson]);

  // Inject control bar dropdown when panel is mounted or tree data changes
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      injectControlBarDropdown(treeData);
    }, 100);

    // Cleanup: remove control bar dropdown when panel is unmounted
    return () => {
      clearTimeout(timer);
      removeControlBarDropdown();
    };
  }, [treeData]);

  // Panel renders nothing visible - it's just a trigger for control bar injection
  // The dropdown appears in the control bar, not in the panel
  return (
    <div
      style={{
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--grafana-colors-text-secondary)',
        fontSize: '12px',
      }}
    >
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div>Hive Selector Control Bar Plugin</div>
        <div style={{ marginTop: '8px', fontSize: '11px', opacity: 0.7 }}>
          The dropdown appears in the dashboard control bar above.
        </div>
        <div style={{ marginTop: '4px', fontSize: '11px', opacity: 0.7 }}>
          Remove this panel to hide the dropdown.
        </div>
      </div>
    </div>
  );
};
