// @ts-nocheck
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTheme2 } from '@grafana/ui';
import { processTreeData } from '../../../shared/utils/treeProcessing';
import { TreeNode } from '../../../shared/types';
import { NestedHiveSelector } from '../../../shared/components/NestedHiveSelector';
import { AlarmSummaryCards } from '../components/AlarmSummaryCards';
import { SiteMap } from '../components/SiteMap';
import { NavigationTree } from '../components/NavigationTree';
import { DashboardHeader } from '../components/DashboardHeader';
import { FilterDropdown } from '../components/FilterDropdown';
import folderIcon from '../../img/icons/folder.svg';
import locationIcon from '../../img/icons/location.svg';
import dashboardIcon from '../../img/icons/dashboard.svg';
import clockIcon from '../../img/icons/clock.svg';
import zoomOutIcon from '../../img/icons/zoom-out.svg';
import refreshIcon from '../../img/icons/refresh.svg';
import arrowLeftIcon from '../../img/icons/arrow-left.svg';
import arrowRightIcon from '../../img/icons/arrow-right.svg';
import { watchURLParams, parseURLParams, updateURLParams } from '../utils/urlParams';
import { hidePanels, showPanels, updateDashboardVariable, refreshDashboard } from '../utils/dashboardControl';
import { addPredefinedPanelSet, removeLibraryPanel } from '../utils/libraryPanelControl';
import { PanelSetSelector } from '../components/PanelSetSelector';
import { ViewSelector, DEFAULT_VIEWS } from '../components/ViewSelector';
import { defaultTree } from '../../../shared/constants';

export const SiteManagerPage: React.FC = () => {
  let theme;
  try {
    theme = useTheme2();
  } catch (error) {
    console.error('Error getting theme:', error);
    // Fallback theme object
    theme = {
      colors: {
        background: { canvas: '#0b0c0e', primary: '#1f1f1f', secondary: '#2d2d2d' },
        text: { primary: '#ffffff', secondary: '#b7b7b7' },
        border: { medium: '#3d3d3d', weak: '#2d2d2d' },
        primary: { main: '#3274d9', contrastText: '#ffffff' },
        success: { main: '#73bf69', contrastText: '#ffffff' },
        info: { main: '#5794f2', contrastText: '#ffffff' },
        error: { main: '#e02f44', contrastText: '#ffffff' },
      },
      shadows: { z3: '0 2px 8px rgba(0,0,0,0.3)' },
    };
  }
  const [selectedSitePath, setSelectedSitePath] = useState<string[]>([]);
  const [selectedSite, setSelectedSite] = useState<TreeNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<string | null>(null);
  const [treeDataJson, setTreeDataJson] = useState<string>('');
  const [devicesJson, setDevicesJson] = useState<string>('');
  const [loadedPanelSet, setLoadedPanelSet] = useState<string | null>(null);
  const urlParamsProcessedRef = useRef<string>('');
  const isInitialLoadRef = useRef(true);
  
  // Dummy filter states
  const [selectedSiteGroup, setSelectedSiteGroup] = useState<string>('All Site Groups');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedSiteFilter, setSelectedSiteFilter] = useState<string | null>(null);

  // Process tree data - use URL params or default tree
  const treeData = useMemo(() => {
    try {
      // Try to get tree data from URL params or localStorage
      const urlParams = new URLSearchParams(window.location.search);
      const treeParam = urlParams.get('treeData');
      
      if (treeParam) {
        return processTreeData(treeParam, devicesJson);
      }

      // Try localStorage
      const storedTree = localStorage.getItem('site-manager-tree-data');
      if (storedTree) {
        return processTreeData(storedTree, devicesJson);
      }

      // Use default tree
      return processTreeData(JSON.stringify(defaultTree), devicesJson);
    } catch (error) {
      console.error('Error processing tree data:', error);
      return processTreeData(JSON.stringify(defaultTree), devicesJson);
    }
  }, [treeDataJson, devicesJson]);

  // Calculate alarm counts from tree data
  const alarmCounts = useMemo(() => {
    const counts = { critical: 0, major: 0, minor: 0, warning: 0, info: 0, normal: 0 };

    const countAlarms = (nodes: TreeNode[]) => {
      nodes.forEach((node) => {
        if (node.maxAlarmSeverity !== undefined) {
          switch (node.maxAlarmSeverity) {
            case 5:
              counts.critical++;
              break;
            case 4:
              counts.major++;
              break;
            case 3:
              counts.minor++;
              break;
            case 2:
              counts.warning++;
              break;
            case 1:
              counts.normal++;
              break;
            case 0:
              counts.info++;
              break;
          }
        }
        if (node.children) {
          countAlarms(node.children);
        }
      });
    };

    countAlarms(treeData);
    return counts;
  }, [treeData]);

  // Generate site locations for map
  const siteLocations = useMemo(() => {
    const locations: Array<{ 
      id: string; 
      name: string; 
      lat: number; 
      lng: number; 
      severity?: number;
      ipAddress?: string;
      state?: string;
      country?: string;
    }> = [];
    
    const extractSites = (nodes: TreeNode[], path: string[] = []) => {
      nodes.forEach((node) => {
        const nodePath = [...path, node.name];
        if (!node.children || node.children.length === 0) {
          const lat = 47.6062 + (Math.random() - 0.5) * 0.1;
          const lng = -122.3321 + (Math.random() - 0.5) * 0.1;
          const nodeAny = node as any;
          
          locations.push({
            id: node.value || node.name,
            name: node.name,
            lat: nodeAny.latitude || nodeAny.lat || lat,
            lng: nodeAny.longitude || nodeAny.lng || nodeAny.lon || lng,
            severity: node.maxAlarmSeverity,
            ipAddress: nodeAny.ipAddress || nodeAny.ip || undefined,
            state: nodeAny.state || undefined,
            country: nodeAny.country || undefined,
          });
        } else {
          extractSites(node.children, nodePath);
        }
      });
    };

    extractSites(treeData);
    return locations;
  }, [treeData]);

  // Map view IDs to panel set names
  const getPanelSetForView = (viewId: string): string => {
    const view = DEFAULT_VIEWS.find((v) => v.id === viewId);
    return view?.panelSet || 'site-overview';
  };

  // Update URL parameters when selections change
  const updateURLFromSelections = (site: TreeNode | null, view: string | null) => {
    const params: Record<string, string | null> = {};
    
    if (site) {
      params.selectedSite = site.value || site.name;
    } else {
      params.selectedSite = null;
    }
    
    if (view) {
      params.selectedView = view;
    } else {
      params.selectedView = null;
    }
    
    updateURLParams(params);
  };

  // Load panel set based on site and view selection
  const loadPanelSetForSelection = async (site: TreeNode | null, view: string | null) => {
    if (!view) {
      // If no view selected, don't load panels
      if (loadedPanelSet) {
        setLoadedPanelSet(null);
      }
      return;
    }

    const panelSetName = getPanelSetForView(view);
    
    // Note: Panel loading in app plugins requires dashboard context
    // For now, we'll just update variables and log the selection
    // In production, you would need to integrate with a dashboard or use a different approach
    
    // Update dashboard variables if possible
    if (site) {
      try {
        updateDashboardVariable('site', site.value || site.name);
      } catch (error) {
        // Dashboard variables might not be available in app plugin context
        console.log(`[SiteManager] Selected site: ${site.name}, view: ${view}`);
      }
    }

    // Try to load panel set (will fail gracefully if dashboard service not available)
    try {
      const success = await addPredefinedPanelSet(panelSetName, site ? { site: site.value || site.name } : undefined);
      if (success) {
        setLoadedPanelSet(panelSetName);
        console.log(`[SiteManager] Loaded panel set: ${panelSetName} for site: ${site?.name || 'none'}`);
      } else {
        // Panel loading not available in app plugin standalone mode
        // This is expected - panel loading works when app plugin is used within a dashboard
        console.log(`[SiteManager] Panel set loading not available in app plugin mode. Selected: ${panelSetName} for site: ${site?.name || 'none'}`);
        setLoadedPanelSet(panelSetName); // Track selection anyway
      }
    } catch (error) {
      // Expected error - panel loading requires dashboard context
      console.log(`[SiteManager] Panel loading requires dashboard context. Selection recorded: ${panelSetName} for site: ${site?.name || 'none'}`);
      setLoadedPanelSet(panelSetName); // Track selection anyway
    }
  };

  const handleNodeSelect = (path: string[], node: TreeNode) => {
    setSelectedSitePath(path);
    setSelectedSite(node);
    if (node.value) {
      setSelectedSiteId(node.value);
    }
    
    // Update URL
    updateURLFromSelections(node, selectedView);
    
    // Load panel set if view is selected
    if (selectedView) {
      loadPanelSetForSelection(node, selectedView);
    }
  };

  const handleViewSelect = (viewId: string) => {
    setSelectedView(viewId);
    
    // Update URL
    updateURLFromSelections(selectedSite, viewId);
    
    // Load panel set if site is selected
    if (selectedSite) {
      loadPanelSetForSelection(selectedSite, viewId);
    } else {
      // Load panel set even without site (will use default variables)
      loadPanelSetForSelection(null, viewId);
    }
  };

  const handleSiteMapClick = (siteId: string) => {
    setSelectedSiteId(siteId);
    const findNodeByValue = (nodes: TreeNode[], value: string, path: string[] = []): { node: TreeNode; path: string[] } | null => {
      for (const node of nodes) {
        const nodePath = [...path, node.name];
        if (node.value === value || node.name === value) {
          return { node, path: nodePath };
        }
        if (node.children) {
          const found = findNodeByValue(node.children, value, nodePath);
          if (found) return found;
        }
      }
      return null;
    };

    const found = findNodeByValue(treeData, siteId);
    if (found) {
      handleNodeSelect(found.path, found.node);
    }
  };

  // Process URL parameters and apply commands
  const processURLCommands = (commands: ReturnType<typeof parseURLParams>) => {
    const commandsKey = JSON.stringify(commands);
    if (commandsKey === urlParamsProcessedRef.current && !isInitialLoadRef.current) {
      return;
    }
    urlParamsProcessedRef.current = commandsKey;
    isInitialLoadRef.current = false;

    // Handle site selection from URL
    if (commands.selectedSite && treeData.length > 0) {
      const findNodeByValue = (nodes: TreeNode[], value: string, path: string[] = []): { node: TreeNode; path: string[] } | null => {
        for (const node of nodes) {
          const nodePath = [...path, node.name];
          if (node.value === value || node.name === value) {
            return { node, path: nodePath };
          }
          if (node.children) {
            const found = findNodeByValue(node.children, value, nodePath);
            if (found) return found;
          }
        }
        return null;
      };
      const found = findNodeByValue(treeData, commands.selectedSite);
      if (found) {
        // Don't update URL again (to avoid loops)
        setSelectedSitePath(found.path);
        setSelectedSite(found.node);
        if (found.node.value) {
          setSelectedSiteId(found.node.value);
        }
      }
    }

    // Handle view selection from URL
    if (commands.selectedView) {
      setSelectedView(commands.selectedView);
    }

    if (commands.hidePanels && commands.hidePanels.length > 0) {
      hidePanels(undefined, commands.hidePanels);
    }

    if (commands.showPanels && commands.showPanels.length > 0) {
      showPanels(undefined, commands.showPanels);
    }

    if (commands.updateVariable) {
      updateDashboardVariable(commands.updateVariable.name, commands.updateVariable.value);
    }

    if (commands.addPanelSet) {
      const variableOverrides: Record<string, string> = {};
      if (commands.updateVariable) {
        variableOverrides[commands.updateVariable.name] = commands.updateVariable.value;
      }
      if (commands.selectedSite) {
        variableOverrides.site = commands.selectedSite;
      }
      
      addPredefinedPanelSet(commands.addPanelSet, Object.keys(variableOverrides).length > 0 ? variableOverrides : undefined)
        .then((success) => {
          if (success) {
            console.log(`[URLParams] Successfully added panel set: ${commands.addPanelSet}`);
          }
        })
        .catch((error) => {
          console.error(`[URLParams] Error adding panel set ${commands.addPanelSet}:`, error);
        });
    }

    if (commands.refresh) {
      refreshDashboard();
    }
  };

  // Watch for URL parameter changes
  useEffect(() => {
    const initialCommands = parseURLParams();
    processURLCommands(initialCommands);

    const cleanup = watchURLParams((commands) => {
      processURLCommands(commands);
    });

    return cleanup;
  }, [treeData]);

  // Load panel set when both site and view are selected
  useEffect(() => {
    // Small delay to ensure state is updated
    const timer = setTimeout(() => {
      if (selectedSite && selectedView) {
        loadPanelSetForSelection(selectedSite, selectedView);
      } else if (selectedView && !selectedSite) {
        // Load panel set even without site (will use default variables)
        loadPanelSetForSelection(null, selectedView);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [selectedSite, selectedView]);

  const handleBack = () => {
    // Navigate back to landing page without page refresh
    window.history.pushState({ view: 'landing' }, '', '/a/mindking-site-manager-dashboard');
    // Dispatch a custom event to notify AppRootPage
    window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'landing' } }));
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: theme.colors.background.canvas,
        overflow: 'hidden',
      }}
    >
      {/* Top Header with Back Button and Alarm Icons */}
      <DashboardHeader
        alarmCounts={alarmCounts}
        onBack={handleBack}
      />

      {/* Control Bar with Dropdowns */}
      <div
        style={{
          padding: '12px 16px',
          background: theme.colors.background.primary,
          borderBottom: `1px solid ${theme.colors.border.medium}`,
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          flexShrink: 0,
        }}
      >
        {/* Left side - Filter dropdowns inside a box (with gaps between dropdowns) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            padding: '8px 0px',
            // background: theme.colors.background.secondary,
            // border: `1px solid ${theme.colors.border.medium}`,
            borderRadius: '4px',
          }}
        >
          {/* Site Groups dropdown */}
          <FilterDropdown
            label="Site Groups"
            icon={<img src={folderIcon} alt="folder" style={{ width: '16px', height: '16px', filter: `brightness(0) saturate(100%) invert(${theme.isDark ? '1' : '0'})` }} />}
            options={['All Site Groups', 'Site Group 1', 'Site Group 2', 'Site Group 3']}
            selectedValue={selectedSiteGroup}
            onSelect={setSelectedSiteGroup}
          />

          {/* All Site Groups filter tag */}
          {selectedSiteGroup && (
            <FilterDropdown
              label={selectedSiteGroup}
              showRemoveButton={true}
              selectedValue={selectedSiteGroup}
              onRemove={() => setSelectedSiteGroup('All Site Groups')}
            />
          )}

          {/* Regions button */}
          <FilterDropdown
            label="Regions"
            icon={<img src={locationIcon} alt="location" style={{ width: '16px', height: '16px', filter: `brightness(0) saturate(100%) invert(${theme.isDark ? '1' : '0'})` }} />}
            options={['All Regions', 'Eastern Region', 'Northern Region', 'Southern Region', 'Western Region']}
            selectedValue={selectedRegion || undefined}
            onSelect={setSelectedRegion}
          />

          {/* Region filter tag */}
          {selectedRegion && (
            <FilterDropdown
              label={selectedRegion}
              showRemoveButton={true}
              selectedValue={selectedRegion}
              onRemove={() => setSelectedRegion(null)}
            />
          )}

          {/* Sites button */}
          <FilterDropdown
            label="Sites"
            icon={<img src={locationIcon} alt="location" style={{ width: '16px', height: '16px', filter: `brightness(0) saturate(100%) invert(${theme.isDark ? '1' : '0'})` }} />}
            options={['All Sites', 'Site 1', 'Site 2', 'Site 3']}
            selectedValue={selectedSiteFilter || undefined}
            onSelect={setSelectedSiteFilter}
          />

          {/* Site filter tag */}
          {selectedSiteFilter && (
            <FilterDropdown
              label={selectedSiteFilter}
              showRemoveButton={true}
              selectedValue={selectedSiteFilter}
              onRemove={() => setSelectedSiteFilter(null)}
            />
          )}

          {/* Hive filter tag (if site is selected) */}
          {selectedSite && (
            <FilterDropdown
              label={selectedSite.name}
              showRemoveButton={true}
              selectedValue={selectedSite.name}
              onRemove={() => {
                setSelectedSitePath([]);
                setSelectedSite(null);
                setSelectedSiteId(null);
                updateURLFromSelections(null, selectedView);
              }}
            />
          )}
        </div>

        {/* Right side - Dashboard controls (with gaps between dropdowns) */}
        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            flexWrap: 'wrap',
            // background: theme.colors.background.secondary,
            // border: `none`,
            borderRadius: '4px',
            padding: '8px 0px',
          }}
        >
          {/* Single Site Dashboards */}
          <FilterDropdown
            label="Single Site Dashboards"
            icon={<img src={dashboardIcon} alt="dashboard" style={{ width: '16px', height: '16px', filter: `brightness(0) saturate(100%) invert(${theme.isDark ? '1' : '0'})` }} />}
            options={['Dashboard 1', 'Dashboard 2', 'Dashboard 3']}
          />

          {/* Multi Site Dashboards */}
          <FilterDropdown
            label="Multi Site Dashboards"
            icon={<img src={dashboardIcon} alt="dashboard" style={{ width: '16px', height: '16px', filter: `brightness(0) saturate(100%) invert(${theme.isDark ? '1' : '0'})` }} />}
            options={['Multi Dashboard 1', 'Multi Dashboard 2']}
          />

          {/* Navigation arrows */}
          <button
            style={{
              padding: '6px',
              background: theme.colors.background.secondary,
              border: `1px solid ${theme.colors.border.medium}`,
              borderRadius: '4px',
              cursor: 'pointer',
              color: theme.colors.text.primary,
              display: 'flex',
              alignItems: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.action?.hover || theme.colors.background.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.background.secondary;
            }}
          >
            <img src={arrowLeftIcon} alt="previous" style={{ width: '16px', height: '16px', filter: `brightness(0) saturate(100%) invert(${theme.isDark ? '1' : '0'})` }} />
          </button>

          {/* Time range selector */}
          <FilterDropdown
            label="Last 6 hours"
            icon={<img src={clockIcon} alt="clock" style={{ width: '16px', height: '16px', filter: `brightness(0) saturate(100%) invert(${theme.isDark ? '1' : '0'})` }} />}
            options={['Last 15 minutes', 'Last 30 minutes', 'Last 1 hour', 'Last 6 hours', 'Last 24 hours', 'Last 7 days']}
          />

          <button
            style={{
              padding: '6px',
              background: theme.colors.background.secondary,
              border: `1px solid ${theme.colors.border.medium}`,
              borderRadius: '4px',
              cursor: 'pointer',
              color: theme.colors.text.primary,
              display: 'flex',
              alignItems: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.action?.hover || theme.colors.background.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.background.secondary;
            }}
          >
            <img src={arrowRightIcon} alt="next" style={{ width: '16px', height: '16px', filter: `brightness(0) saturate(100%) invert(${theme.isDark ? '1' : '0'})` }} />
          </button>

          {/* Zoom out icon */}
          <button
            style={{
              padding: '6px',
              background: theme.colors.background.secondary,
              border: `1px solid ${theme.colors.border.medium}`,
              borderRadius: '4px',
              cursor: 'pointer',
              color: theme.colors.text.primary,
              display: 'flex',
              alignItems: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.action?.hover || theme.colors.background.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.background.secondary;
            }}
          >
            <img src={zoomOutIcon} alt="zoom out" style={{ width: '16px', height: '16px', filter: `brightness(0) saturate(100%) invert(${theme.isDark ? '1' : '0'})` }} />
          </button>

          {/* Refresh button */}
          <FilterDropdown
            label="Refresh"
            icon={<img src={refreshIcon} alt="refresh" style={{ width: '16px', height: '16px', filter: `brightness(0) saturate(100%) invert(${theme.isDark ? '1' : '0'})` }} />}
            options={['Refresh Now', 'Auto Refresh: 5s', 'Auto Refresh: 10s', 'Auto Refresh: 30s']}
            onSelect={(value) => {
              if (value === 'Refresh Now') {
                refreshDashboard();
              }
            }}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        {/* Left Sidebar - Navigation Tree */}
        <div
          style={{
            width: '300px',
            minWidth: '300px',
            padding: '16px',
            borderRight: `1px solid ${theme.colors.border.medium}`,
            background: theme.colors.background.primary,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
          }}
        >
          <NavigationTree
            treeData={treeData}
            selectedPath={selectedSitePath}
            onNodeSelect={handleNodeSelect}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Main Dashboard Content */}
        <div
          style={{
            flex: 1,
            padding: '24px',
            overflowY: 'auto',
            background: theme.colors.background.canvas,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          {/* Info Message */}
          {(!selectedSite || !selectedView) && (
            <div
              style={{
                padding: '16px',
                background: theme.colors.info.main,
                color: theme.colors.info.contrastText,
                borderRadius: '4px',
                marginBottom: '16px',
                fontSize: '14px',
              }}
            >
              {!selectedSite && !selectedView && 'Please select a site/group and a view to load metrics.'}
              {!selectedSite && selectedView && 'Please select a site/group to load metrics for the selected view.'}
              {selectedSite && !selectedView && 'Please select a view (appliance type) to load the appropriate metrics.'}
            </div>
          )}

          {/* Selection Confirmation */}
          {selectedSite && selectedView && (
            <div
              style={{
                padding: '12px 16px',
                background: theme.colors.success.main,
                color: theme.colors.success.contrastText,
                borderRadius: '4px',
                marginBottom: '16px',
                fontSize: '14px',
              }}
            >
              ✓ Selected: <strong>{selectedSite.name}</strong> | View: <strong>{selectedView}</strong>
              <br />
              <small style={{ opacity: 0.9 }}>
                Note: Dynamic panel loading requires library panels to be configured. The selection is saved in the URL.
              </small>
            </div>
          )}

          {/* Panel Set Selector - Optional manual panel loading */}
          {/* <PanelSetSelector
            onPanelSetAdded={(setName) => {
              console.log(`Panel set added: ${setName}`);
            }}
          /> */}

          {/* Alarm Summary Cards */}
          <AlarmSummaryCards
            critical={alarmCounts.critical}
            major={alarmCounts.major}
            minor={alarmCounts.minor}
            warning={alarmCounts.warning}
          />

          {/* Site Map */}
          <div style={{ marginBottom: '24px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 500,
                color: theme.colors.text.primary,
                marginBottom: '12px',
                flexShrink: 0,
              }}
            >
              Site Map
            </h2>
            <div style={{ flex: 1, minHeight: 0 }}>
              <SiteMap
                sites={siteLocations}
                selectedSiteId={selectedSiteId}
                onSiteClick={handleSiteMapClick}
                height="100%"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

