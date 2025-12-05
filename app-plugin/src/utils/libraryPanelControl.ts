// @ts-nocheck
/**
 * Library Panel Control Utility
 * Provides functions to dynamically add/remove library panels to dashboards
 */

import { getDashboardSrv, getBackendSrv } from '@grafana/runtime';

export interface LibraryPanelConfig {
  uid: string; // Library panel UID (required)
  title?: string; // Optional custom title override
  gridPos?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  variables?: Record<string, string>; // Variable overrides for the panel
}

export interface PanelSet {
  name: string; // Name of the panel set
  description?: string;
  libraryPanels: LibraryPanelConfig[]; // Array of library panels to add
}

/**
 * Add a library panel to the current dashboard
 */
export async function addLibraryPanel(config: LibraryPanelConfig): Promise<boolean> {
  try {
    // In app plugins, getDashboardSrv might not be available
    let dashboardSrv;
    try {
      dashboardSrv = getDashboardSrv();
    } catch (error) {
      console.warn('[LibraryPanelControl] getDashboardSrv not available in app plugin context');
      return false;
    }

    if (!dashboardSrv) {
      console.warn('[LibraryPanelControl] Dashboard service not available');
      return false;
    }

    const dashboard = dashboardSrv.getCurrent();
    if (!dashboard) {
      console.warn('[LibraryPanelControl] No dashboard found. App plugins need to be used within a dashboard context.');
      return false;
    }

    // Fetch the library panel definition
    const libraryPanel = await getBackendSrv().get(`/api/library-elements/${config.uid}`);
    
    if (!libraryPanel || !libraryPanel.model) {
      console.error(`[LibraryPanelControl] Library panel with UID ${config.uid} not found`);
      return false;
    }

    // Create a new panel based on the library panel
    const newPanel = {
      ...libraryPanel.model,
      id: Date.now(), // Generate a unique ID
      gridPos: config.gridPos || {
        x: 0,
        y: 0,
        w: 12,
        h: 8,
      },
      libraryPanel: {
        uid: config.uid,
        name: libraryPanel.name,
      },
    };

    // Override title if provided
    if (config.title) {
      newPanel.title = config.title;
    }

    // Apply variable overrides if provided
    if (config.variables) {
      Object.entries(config.variables).forEach(([key, value]) => {
        // Update panel targets/queries with variable values
        if (newPanel.targets) {
          newPanel.targets.forEach((target: any) => {
            // Replace variable references in queries
            if (target.expr) {
              target.expr = target.expr.replace(new RegExp(`\\$${key}`, 'g'), value);
            }
            if (target.query) {
              target.query = target.query.replace(new RegExp(`\\$${key}`, 'g'), value);
            }
          });
        }
      });
    }

    // Calculate grid position (place below existing panels)
    if (!config.gridPos) {
      const existingPanels = dashboard.panels || [];
      const maxY = existingPanels.reduce((max: number, panel: any) => {
        const panelBottom = (panel.gridPos?.y || 0) + (panel.gridPos?.h || 0);
        return Math.max(max, panelBottom);
      }, 0);
      
      newPanel.gridPos = {
        x: 0,
        y: maxY,
        w: 12,
        h: 8,
      };
    }

    // Add panel to dashboard
    dashboard.addPanel(newPanel);
    dashboard.refresh();

    console.log(`[LibraryPanelControl] Added library panel: ${libraryPanel.name} (UID: ${config.uid})`);
    return true;
  } catch (error) {
    console.error('[LibraryPanelControl] Error adding library panel:', error);
    return false;
  }
}

/**
 * Add multiple library panels (a panel set) to the dashboard
 */
export async function addPanelSet(panelSet: PanelSet): Promise<boolean> {
  try {
    console.log(`[LibraryPanelControl] Adding panel set: ${panelSet.name}`);
    
    let successCount = 0;
    let currentY = 0;

    // Get current max Y position - with error handling
    let dashboard;
    try {
      const dashboardSrv = getDashboardSrv();
      if (dashboardSrv) {
        dashboard = dashboardSrv.getCurrent();
      }
    } catch (error) {
      console.warn('[LibraryPanelControl] getDashboardSrv not available in app plugin context');
      return false;
    }

    if (dashboard && dashboard.panels) {
      currentY = dashboard.panels.reduce((max: number, panel: any) => {
        const panelBottom = (panel.gridPos?.y || 0) + (panel.gridPos?.h || 0);
        return Math.max(max, panelBottom);
      }, 0);
    }

    // Add each library panel
    for (let i = 0; i < panelSet.libraryPanels.length; i++) {
      const panelConfig = panelSet.libraryPanels[i];
      
      // Auto-calculate grid position if not provided
      if (!panelConfig.gridPos) {
        panelConfig.gridPos = {
          x: (i % 2) * 12, // Two columns: 0 or 12
          y: currentY + Math.floor(i / 2) * 8, // Stack vertically
          w: 12,
          h: 8,
        };
      }

      const success = await addLibraryPanel(panelConfig);
      if (success) {
        successCount++;
      }
    }

    console.log(`[LibraryPanelControl] Added ${successCount}/${panelSet.libraryPanels.length} panels from set: ${panelSet.name}`);
    return successCount === panelSet.libraryPanels.length;
  } catch (error) {
    console.error('[LibraryPanelControl] Error adding panel set:', error);
    return false;
  }
}

/**
 * Remove a panel by library panel UID
 */
export function removeLibraryPanel(uid: string): boolean {
  try {
    let dashboardSrv;
    try {
      dashboardSrv = getDashboardSrv();
    } catch (error) {
      console.warn('[LibraryPanelControl] getDashboardSrv not available');
      return false;
    }

    if (!dashboardSrv) {
      return false;
    }

    const dashboard = dashboardSrv.getCurrent();
    if (!dashboard || !dashboard.panels) {
      console.warn('[LibraryPanelControl] No dashboard or panels found');
      return false;
    }

    // Find panels that reference this library panel
    const panelsToRemove = dashboard.panels.filter((panel: any) => 
      panel.libraryPanel?.uid === uid
    );

    if (panelsToRemove.length === 0) {
      console.warn(`[LibraryPanelControl] No panels found with library panel UID: ${uid}`);
      return false;
    }

    // Remove panels
    panelsToRemove.forEach((panel: any) => {
      dashboard.removePanel(panel);
    });

    dashboard.refresh();
    console.log(`[LibraryPanelControl] Removed ${panelsToRemove.length} panel(s) with library panel UID: ${uid}`);
    return true;
  } catch (error) {
    console.error('[LibraryPanelControl] Error removing library panel:', error);
    return false;
  }
}

/**
 * Get all available library panels
 */
export async function getAvailableLibraryPanels(): Promise<Array<{ uid: string; name: string; description?: string }>> {
  try {
    let backendSrv;
    try {
      backendSrv = getBackendSrv();
    } catch (error) {
      console.warn('[LibraryPanelControl] getBackendSrv not available');
      return [];
    }

    if (!backendSrv) {
      return [];
    }

    const response = await backendSrv.get('/api/library-elements?kind=1'); // kind=1 for panels
    return response.elements?.map((element: any) => ({
      uid: element.uid,
      name: element.name,
      description: element.description,
    })) || [];
  } catch (error) {
    console.error('[LibraryPanelControl] Error fetching library panels:', error);
    return [];
  }
}

/**
 * Predefined panel sets (can be configured)
 * These are examples - you'll create these in Grafana's Library Panels UI first
 * 
 * View-based panel sets (appliance types):
 * - generator-metrics: Generator-specific metrics
 * - power-system-metrics: Power system metrics
 * - cooling-metrics: Cooling system metrics
 * - network-metrics: Network metrics
 * - site-overview: General site overview
 */
export const PREDEFINED_PANEL_SETS: Record<string, PanelSet> = {
  'site-overview': {
    name: 'Site Overview',
    description: 'Basic site metrics and status',
    libraryPanels: [
      { uid: 'site-status-panel-uid', title: 'Site Status' },
      { uid: 'site-alarms-panel-uid', title: 'Active Alarms' },
      { uid: 'site-uptime-panel-uid', title: 'Uptime' },
    ],
  },
  'generator-metrics': {
    name: 'Generator Metrics',
    description: 'Generator-specific metrics and status',
    libraryPanels: [
      { uid: 'generator-status-panel-uid', title: 'Generator Status' },
      { uid: 'generator-power-panel-uid', title: 'Power Output' },
      { uid: 'generator-fuel-panel-uid', title: 'Fuel Level' },
      { uid: 'generator-temp-panel-uid', title: 'Temperature' },
      { uid: 'generator-runtime-panel-uid', title: 'Runtime Hours' },
    ],
  },
  'power-system-metrics': {
    name: 'Power System Metrics',
    description: 'Power system metrics and analysis',
    libraryPanels: [
      { uid: 'power-voltage-panel-uid', title: 'Voltage' },
      { uid: 'power-current-panel-uid', title: 'Current' },
      { uid: 'power-frequency-panel-uid', title: 'Frequency' },
      { uid: 'power-load-panel-uid', title: 'Load Distribution' },
    ],
  },
  'cooling-metrics': {
    name: 'Cooling System Metrics',
    description: 'Cooling system metrics and status',
    libraryPanels: [
      { uid: 'cooling-temp-panel-uid', title: 'Temperature' },
      { uid: 'cooling-flow-panel-uid', title: 'Flow Rate' },
      { uid: 'cooling-pressure-panel-uid', title: 'Pressure' },
      { uid: 'cooling-status-panel-uid', title: 'System Status' },
    ],
  },
  'network-metrics': {
    name: 'Network Metrics',
    description: 'Network metrics and connectivity',
    libraryPanels: [
      { uid: 'network-bandwidth-panel-uid', title: 'Bandwidth' },
      { uid: 'network-latency-panel-uid', title: 'Latency' },
      { uid: 'network-connections-panel-uid', title: 'Connections' },
      { uid: 'network-status-panel-uid', title: 'Network Status' },
    ],
  },
  'detailed-metrics': {
    name: 'Detailed Metrics',
    description: 'Comprehensive performance metrics',
    libraryPanels: [
      { uid: 'cpu-metrics-panel-uid', title: 'CPU Usage' },
      { uid: 'memory-metrics-panel-uid', title: 'Memory Usage' },
      { uid: 'network-metrics-panel-uid', title: 'Network Traffic' },
      { uid: 'disk-metrics-panel-uid', title: 'Disk Usage' },
    ],
  },
  'alarm-analysis': {
    name: 'Alarm Analysis',
    description: 'Alarm trends and analysis',
    libraryPanels: [
      { uid: 'alarm-timeline-panel-uid', title: 'Alarm Timeline' },
      { uid: 'alarm-severity-panel-uid', title: 'Severity Distribution' },
      { uid: 'alarm-trends-panel-uid', title: 'Alarm Trends' },
    ],
  },
};

/**
 * Add a predefined panel set by name
 */
export async function addPredefinedPanelSet(setName: string, variableOverrides?: Record<string, string>): Promise<boolean> {
  const panelSet = PREDEFINED_PANEL_SETS[setName];
  if (!panelSet) {
    console.error(`[LibraryPanelControl] Panel set '${setName}' not found`);
    return false;
  }

  // Apply variable overrides if provided
  if (variableOverrides) {
    panelSet.libraryPanels = panelSet.libraryPanels.map((panel) => ({
      ...panel,
      variables: { ...panel.variables, ...variableOverrides },
    }));
  }

  return addPanelSet(panelSet);
}

