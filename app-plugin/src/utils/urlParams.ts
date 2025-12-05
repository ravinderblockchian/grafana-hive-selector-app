// @ts-nocheck
/**
 * URL Parameter Parser for iframe communication
 * Reads and parses URL parameters from the iframe URL
 */

export interface URLCommands {
  selectedSite?: string;
  selectedNode?: string;
  selectedView?: string; // View/appliance type (e.g., 'generator', 'power-system')
  hidePanels?: string[]; // Comma-separated panel IDs or titles
  showPanels?: string[]; // Comma-separated panel IDs or titles
  addPanelSet?: string; // Name of panel set to add
  arrangeMode?: 'compact' | 'normal' | 'expanded';
  updateVariable?: { name: string; value: string };
  refresh?: boolean;
}

/**
 * Parse URL parameters from current window location
 */
export function parseURLParams(): URLCommands {
  const params = new URLSearchParams(window.location.search);
  const commands: URLCommands = {};

  // Parse selectedSite or selectedNode (both work)
  const selectedSite = params.get('selectedSite') || params.get('selectedNode');
  if (selectedSite) {
    commands.selectedSite = selectedSite;
  }

  // Parse hidePanels (comma-separated)
  const hidePanels = params.get('hidePanels');
  if (hidePanels) {
    commands.hidePanels = hidePanels.split(',').map((p) => p.trim()).filter(Boolean);
  }

  // Parse showPanels (comma-separated)
  const showPanels = params.get('showPanels');
  if (showPanels) {
    commands.showPanels = showPanels.split(',').map((p) => p.trim()).filter(Boolean);
  }

  // Parse selectedView
  const selectedView = params.get('selectedView') || params.get('view');
  if (selectedView) {
    commands.selectedView = selectedView;
  }

  // Parse addPanelSet
  const addPanelSet = params.get('addPanelSet');
  if (addPanelSet) {
    commands.addPanelSet = addPanelSet;
  }

  // Parse arrangeMode
  const arrangeMode = params.get('arrangeMode');
  if (arrangeMode && ['compact', 'normal', 'expanded'].includes(arrangeMode)) {
    commands.arrangeMode = arrangeMode as 'compact' | 'normal' | 'expanded';
  }

  // Parse updateVariable (format: variableName=variableValue)
  const variableName = params.get('variableName');
  const variableValue = params.get('variableValue');
  if (variableName && variableValue) {
    commands.updateVariable = { name: variableName, value: variableValue };
  }

  // Parse refresh flag
  if (params.get('refresh') === 'true' || params.get('refresh') === '1') {
    commands.refresh = true;
  }

  return commands;
}

/**
 * Watch for URL parameter changes
 * Returns a cleanup function
 */
export function watchURLParams(callback: (commands: URLCommands) => void): () => void {
  // Initial call
  callback(parseURLParams());

  // Watch for popstate events (back/forward navigation)
  const handlePopState = () => {
    callback(parseURLParams());
  };
  window.addEventListener('popstate', handlePopState);

  // Watch for hash changes (some iframe implementations use hash)
  const handleHashChange = () => {
    callback(parseURLParams());
  };
  window.addEventListener('hashchange', handleHashChange);

  // Poll for URL changes (in case parent changes iframe src without triggering events)
  // This is a fallback for cases where iframe src changes don't trigger events
  const pollInterval = setInterval(() => {
    callback(parseURLParams());
  }, 500); // Check every 500ms

  // Cleanup function
  return () => {
    window.removeEventListener('popstate', handlePopState);
    window.removeEventListener('hashchange', handleHashChange);
    clearInterval(pollInterval);
  };
}

/**
 * Get a specific URL parameter value
 */
export function getURLParam(name: string): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

/**
 * Update URL parameters without page reload
 * Note: This updates the current page URL, not the iframe src
 * The parent application should update the iframe src for this to work
 */
export function updateURLParams(updates: Record<string, string | null>): void {
  const params = new URLSearchParams(window.location.search);
  
  Object.entries(updates).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  });

  const newURL = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
  window.history.replaceState({}, '', newURL);
}

