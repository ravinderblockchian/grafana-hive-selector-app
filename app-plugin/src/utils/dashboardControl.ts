// @ts-nocheck
/**
 * Dashboard Panel Control Utility
 * Provides functions to show/hide/rearrange panels programmatically
 */

import { getDashboardSrv } from '@grafana/runtime';

export interface PanelControlOptions {
  panelIds?: number[]; // Panel IDs to control
  panelTitles?: string[]; // Panel titles to find and control
  visible?: boolean; // Show or hide
}

/**
 * Find panels by ID or title
 */
function findPanels(panelIds?: number[], panelTitles?: string[]): any[] {
  try {
    const dashboard = getDashboardSrv().getCurrent();
    if (!dashboard || !dashboard.panels) {
      console.warn('[DashboardControl] No dashboard or panels found');
      return [];
    }

    const foundPanels: any[] = [];
    const foundIds = new Set<number>(); // Track found panel IDs to avoid duplicates

    // Find by IDs
    if (panelIds && panelIds.length > 0) {
      panelIds.forEach((id) => {
        const panel = dashboard.panels.find((p: any) => p.id === id);
        if (panel && !foundIds.has(panel.id)) {
          foundPanels.push(panel);
          foundIds.add(panel.id);
        }
      });
    }

    // Find by titles (case-insensitive, supports partial match)
    if (panelTitles && panelTitles.length > 0) {
      panelTitles.forEach((title) => {
        const searchTitle = title.trim().toLowerCase();
        if (!searchTitle) return;
        
        const panel = dashboard.panels.find((p: any) => {
          const panelTitle = (p.title || '').toLowerCase();
          return panelTitle === searchTitle || panelTitle.includes(searchTitle);
        });
        
        if (panel && !foundIds.has(panel.id)) {
          foundPanels.push(panel);
          foundIds.add(panel.id);
        }
      });
    }

    return foundPanels;
  } catch (error) {
    console.error('[DashboardControl] Error finding panels:', error);
    return [];
  }
}

/**
 * Show or hide panels
 */
export function setPanelVisibility(options: PanelControlOptions): boolean {
  try {
    const dashboard = getDashboardSrv().getCurrent();
    if (!dashboard) {
      console.warn('[DashboardControl] No dashboard found');
      return false;
    }

    const panels = findPanels(options.panelIds, options.panelTitles);
    
    if (panels.length === 0) {
      console.warn('[DashboardControl] No panels found matching criteria', {
        panelIds: options.panelIds,
        panelTitles: options.panelTitles,
        availablePanels: getPanelInfo(),
      });
      return false;
    }

    let hasChanges = false;
    panels.forEach((panel) => {
      // Grafana panels have a 'gridPos' property that controls visibility
      // When gridPos.h === 0 or gridPos.w === 0, panel is hidden
      if (options.visible === false) {
        // Check if panel is already hidden
        const isAlreadyHidden = panel.gridPos && (panel.gridPos.h === 0 || panel.gridPos.w === 0);
        
        if (!isAlreadyHidden) {
          // Store original position for later restoration
          if (!panel._originalGridPos && panel.gridPos) {
            panel._originalGridPos = { 
              x: panel.gridPos.x, 
              y: panel.gridPos.y, 
              w: panel.gridPos.w, 
              h: panel.gridPos.h 
            };
          }
          // Hide panel by setting gridPos to 0
          panel.gridPos = { x: 0, y: 0, w: 0, h: 0 };
          hasChanges = true;
          console.log(`[DashboardControl] Hiding panel: ${panel.title || panel.id}`);
        }
      } else if (options.visible === true) {
        // Check if panel is currently hidden
        const isHidden = panel.gridPos && (panel.gridPos.h === 0 || panel.gridPos.w === 0);
        
        if (isHidden) {
          // Show panel by restoring original gridPos
          if (panel._originalGridPos) {
            panel.gridPos = { 
              x: panel._originalGridPos.x, 
              y: panel._originalGridPos.y, 
              w: panel._originalGridPos.w, 
              h: panel._originalGridPos.h 
            };
            delete panel._originalGridPos;
            hasChanges = true;
            console.log(`[DashboardControl] Showing panel: ${panel.title || panel.id}`);
          } else {
            // Restore to default size if no original position stored
            panel.gridPos = { x: 0, y: 0, w: 12, h: 8 };
            hasChanges = true;
            console.log(`[DashboardControl] Showing panel with default size: ${panel.title || panel.id}`);
          }
        }
      }
    });

    if (hasChanges) {
      // Update dashboard and refresh
      // Use setTimeout to ensure DOM updates are processed
      setTimeout(() => {
        try {
          dashboard.updatePanels(dashboard.panels);
          dashboard.refresh();
        } catch (error) {
          console.error('[DashboardControl] Error updating dashboard:', error);
        }
      }, 100);
      return true;
    }

    return false;
  } catch (error) {
    console.error('[DashboardControl] Error setting panel visibility:', error);
    return false;
  }
}

/**
 * Hide specific panels
 */
export function hidePanels(panelIds?: number[], panelTitles?: string[]): boolean {
  return setPanelVisibility({ panelIds, panelTitles, visible: false });
}

/**
 * Show specific panels
 */
export function showPanels(panelIds?: number[], panelTitles?: string[]): boolean {
  return setPanelVisibility({ panelIds, panelTitles, visible: true });
}

/**
 * Rearrange panels (change order)
 * Note: This is more complex and may require dashboard layout recalculation
 */
export function rearrangePanels(panelOrder: number[]): boolean {
  try {
    const dashboard = getDashboardSrv().getCurrent();
    if (!dashboard || !dashboard.panels) {
      console.warn('[DashboardControl] No dashboard or panels found');
      return false;
    }

    // Create a map of panel IDs to panels
    const panelMap = new Map();
    dashboard.panels.forEach((panel: any) => {
      panelMap.set(panel.id, panel);
    });

    // Reorder panels based on provided order
    const reorderedPanels: any[] = [];
    panelOrder.forEach((id) => {
      const panel = panelMap.get(id);
      if (panel) {
        reorderedPanels.push(panel);
        panelMap.delete(id);
      }
    });

    // Add any remaining panels that weren't in the order list
    panelMap.forEach((panel) => {
      reorderedPanels.push(panel);
    });

    // Update dashboard with reordered panels
    dashboard.updatePanels(reorderedPanels);
    dashboard.refresh();
    return true;
  } catch (error) {
    console.error('[DashboardControl] Error rearranging panels:', error);
    return false;
  }
}

/**
 * Update dashboard variable
 */
export function updateDashboardVariable(name: string, value: string): boolean {
  try {
    const dashboard = getDashboardSrv().getCurrent();
    if (!dashboard) {
      console.warn('[DashboardControl] No dashboard found');
      return false;
    }

    const templateVar = dashboard.templateVars?.find((v: any) => v.name === name);
    if (templateVar) {
      templateVar.current = { value: value, text: value };
      dashboard.refresh();
      return true;
    } else {
      console.warn(`[DashboardControl] Variable '${name}' not found`);
      return false;
    }
  } catch (error) {
    console.error('[DashboardControl] Error updating dashboard variable:', error);
    return false;
  }
}

/**
 * Refresh dashboard
 */
export function refreshDashboard(): void {
  try {
    const dashboard = getDashboardSrv().getCurrent();
    if (dashboard) {
      dashboard.refresh();
    }
  } catch (error) {
    console.error('[DashboardControl] Error refreshing dashboard:', error);
  }
}

/**
 * Get all panel IDs and titles for debugging
 */
export function getPanelInfo(): Array<{ id: number; title: string }> {
  try {
    const dashboard = getDashboardSrv().getCurrent();
    if (!dashboard || !dashboard.panels) {
      return [];
    }

    return dashboard.panels.map((panel: any) => ({
      id: panel.id,
      title: panel.title || `Panel ${panel.id}`,
    }));
  } catch (error) {
    console.error('[DashboardControl] Error getting panel info:', error);
    return [];
  }
}

