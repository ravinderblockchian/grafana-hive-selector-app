// @ts-nocheck

import { PanelPlugin } from '@grafana/data';
import { NestedHiveSelectorPanel } from './NestedHiveSelectorPanel';
import { NestedOptions } from '../../shared/types';
import { defaultTree } from '../../shared/constants';

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
