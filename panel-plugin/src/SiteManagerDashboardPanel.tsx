// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { PanelProps } from '@grafana/data';
import { useTheme2 } from '@grafana/ui';
import { processTreeData } from '../../shared/utils/treeProcessing';
import { NestedOptions, TreeNode } from '../../shared/types';
import { NestedHiveSelector } from '../../shared/components/NestedHiveSelector';
import { AlarmSummaryCards } from './components/AlarmSummaryCards';
import { SiteMap } from './components/SiteMap';
import { NavigationTree } from './components/NavigationTree';

export const SiteManagerDashboardPanel: React.FC<PanelProps<NestedOptions>> = ({
  options,
  width,
  height,
}) => {
  const theme = useTheme2();
  const [selectedSitePath, setSelectedSitePath] = useState<string[]>([]);
  const [selectedSite, setSelectedSite] = useState<TreeNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);

  // Process tree data from panel options
  const treeData = useMemo(() => {
    return processTreeData(options.jsonData, options.devicesJson);
  }, [options.jsonData, options.devicesJson]);

  // Calculate alarm counts from tree data
  const alarmCounts = useMemo(() => {
    const counts = { critical: 0, major: 0, minor: 0, warning: 0 };

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

  // Generate mock site locations for map (in production, this would come from API)
  // TODO: Replace with actual API call to fetch sites with lat/lng, ipAddress, state, country
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
        // Leaf nodes are considered sites
        if (!node.children || node.children.length === 0) {
          // Generate mock coordinates (in production, get from API)
          // For now, using mock data - replace with actual API call
          const lat = 47.6062 + (Math.random() - 0.5) * 0.1;
          const lng = -122.3321 + (Math.random() - 0.5) * 0.1;
          
          // Extract additional data from node if available (when API integration is done)
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

  const handleNodeSelect = (path: string[], node: TreeNode) => {
    setSelectedSitePath(path);
    setSelectedSite(node);
    if (node.value) {
      setSelectedSiteId(node.value);
    }
  };

  const handleSiteMapClick = (siteId: string) => {
    setSelectedSiteId(siteId);
    // Find and select the corresponding node in tree
    const findNode = (nodes: TreeNode[], path: string[] = []): { node: TreeNode; path: string[] } | null => {
      for (const node of nodes) {
        const nodePath = [...path, node.name];
        if (node.value === siteId || node.name === siteId) {
          return { node, path: nodePath };
        }
        if (node.children) {
          const found = findNode(node.children, nodePath);
          if (found) return found;
        }
      }
      return null;
    };

    const found = findNode(treeData);
    if (found) {
      handleNodeSelect(found.path, found.node);
    }
  };

  return (
    <div
      style={{
        width,
        height,
        display: 'flex',
        flexDirection: 'column',
        background: theme.colors.background.canvas,
        overflow: 'hidden',
      }}
    >
      {/* Top Control Bar */}
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
        <NestedHiveSelector
          treeData={treeData}
          labelText="Site/Group"
          selectedValue={selectedSite?.name || null}
          selectedPath={selectedSitePath}
          onSelectionChange={(value, path, nodeValue) => {
            const findNode = (nodes: TreeNode[], currentPath: string[] = []): TreeNode | null => {
              for (const node of nodes) {
                const nodePath = [...currentPath, node.name];
                if (nodePath.join('|') === path.join('|')) {
                  return node;
                }
                if (node.children) {
                  const found = findNode(node.children, nodePath);
                  if (found) return found;
                }
              }
              return null;
            };
            const node = findNode(treeData);
            if (node) {
              handleNodeSelect(path, node);
            }
          }}
          onClear={() => {
            setSelectedSitePath([]);
            setSelectedSite(null);
            setSelectedSiteId(null);
          }}
          width="350px"
        />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: theme.colors.text.secondary }}>
            Last 6 hours
          </span>
          <button
            style={{
              padding: '6px 12px',
              background: theme.colors.background.secondary,
              border: `1px solid ${theme.colors.border.medium}`,
              borderRadius: '4px',
              cursor: 'pointer',
              color: theme.colors.text.primary,
            }}
          >
            Refresh
          </button>
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
                height="100%" // Use 100% of available space
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

