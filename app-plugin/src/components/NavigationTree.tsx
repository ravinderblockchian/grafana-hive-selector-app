// @ts-nocheck
import React, { useState, useMemo, useEffect } from 'react';
import { useTheme2 } from '@grafana/ui';
import { TreeNode } from '../../../shared/types';
import { SEVERITY_CONFIG } from '../../../shared/constants';
import folderIcon from '../../img/icons/folder.svg';
import locationIcon from '../../img/icons/location.svg';

interface NavigationTreeProps {
  treeData: TreeNode[];
  selectedPath?: string[];
  onNodeSelect?: (path: string[], node: TreeNode) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const NavigationTree: React.FC<NavigationTreeProps> = ({
  treeData,
  selectedPath = [],
  onNodeSelect,
  searchQuery = '',
  onSearchChange,
}) => {
  const theme = useTheme2();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getSeverityIcon = (severity?: number) => {
    if (severity === undefined || severity === null) return null;
    const config = SEVERITY_CONFIG[severity as keyof typeof SEVERITY_CONFIG];
    return config?.icon || null;
  };

  const getSeverityColor = (severity?: number) => {
    if (severity === undefined || severity === null) return null;
    const config = SEVERITY_CONFIG[severity as keyof typeof SEVERITY_CONFIG];
    return config?.color || null;
  };

  // Helper function to check if a node or any of its descendants match the search query
  const nodeMatchesSearch = (node: TreeNode, query: string): boolean => {
    if (!query) return true;
    const lowerQuery = query.toLowerCase();
    
    // Check if current node matches
    if (node.name.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    // Check if node has value/id that matches
    if (node.value && node.value.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    if (node.id && node.id.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    // Recursively check children
    if (node.children && node.children.length > 0) {
      return node.children.some((child) => nodeMatchesSearch(child, query));
    }
    
    return false;
  };

  // Auto-expand nodes that have matching descendants when searching
  React.useEffect(() => {
    if (searchQuery) {
      const newExpanded: Record<string, boolean> = {};
      const expandMatchingNodes = (nodes: TreeNode[], path: string[] = []) => {
        nodes.forEach((node) => {
          const nodePath = [...path, node.name];
          const key = nodePath.join('|');
          
          if (node.children && node.children.length > 0) {
            // Check if any descendant matches
            if (nodeMatchesSearch(node, searchQuery)) {
              newExpanded[key] = true;
            }
            // Recursively check children
            expandMatchingNodes(node.children, nodePath);
          }
        });
      };
      
      expandMatchingNodes(treeData);
      setExpanded((prev) => ({ ...prev, ...newExpanded }));
    }
  }, [searchQuery, treeData]);

  const renderTree = (nodes: TreeNode[], path: string[] = [], level = 0): React.ReactNode => {
    if (!nodes || nodes.length === 0) return null;

    return nodes.map((node) => {
      const nodePath = [...path, node.name];
      const key = nodePath.join('|');
      const isExpanded = expanded[key] || false;
      const isSelected = selectedPath.join('|') === key;
      const hasChildren = node.children && node.children.length > 0;
      const severityIcon = getSeverityIcon(node.maxAlarmSeverity);
      const severityColor = getSeverityColor(node.maxAlarmSeverity);

      // Filter by search query - use recursive matching
      if (searchQuery && !nodeMatchesSearch(node, searchQuery)) {
        return null;
      }

      return (
        <div key={key}>
          <div
            style={{
              padding: '8px 12px',
              paddingLeft: `${level * 20 + 12}px`,
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              backgroundColor: isSelected ? theme.colors.action.selected : 'transparent',
              minHeight: '32px',
              fontSize: '14px',
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.backgroundColor = theme.colors.action.hover;
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
            onClick={() => {
              if (hasChildren) {
                toggleExpand(key);
              }
              onNodeSelect?.(nodePath, node);
            }}
          >
            {/* Expand/collapse arrow */}
            {hasChildren ? (
              <span
                style={{
                  marginRight: '8px',
                  fontSize: '10px',
                  color: theme.colors.text.secondary,
                  width: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isExpanded ? '▼' : '▶'}
              </span>
            ) : (
              <span style={{ width: '20px', display: 'inline-block' }} />
            )}

            {/* Folder/File/Location icon */}
            {hasChildren ? (
              // Folder icon for parent nodes
              <img
                src={folderIcon}
                alt="folder"
                style={{
                  width: '16px',
                  height: '16px',
                  marginRight: '8px',
                  flexShrink: 0,
                  filter: `brightness(0) saturate(100%) invert(${theme.isDark ? '1' : '0'})`,
                }}
              />
            ) : (
              // Location icon for sites (leaf nodes)
              <img
                src={locationIcon}
                alt="location"
                style={{
                  width: '16px',
                  height: '16px',
                  marginRight: '8px',
                  flexShrink: 0,
                  filter: `brightness(0) saturate(100%) invert(${theme.isDark ? '1' : '0'})`,
                }}
              />
            )}

            {/* Severity icon */}
            {severityIcon && (
              <img
                src={severityIcon}
                alt="severity"
                style={{
                  width: '16px',
                  height: '16px',
                  marginRight: '8px',
                  flexShrink: 0,
                }}
              />
            )}

            {/* Node name */}
            <span
              style={{
                color: theme.colors.text.primary,
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {node.name}
            </span>

            {/* Count badge for parent nodes */}
            {hasChildren && (
              <span
                style={{
                  fontSize: '12px',
                  color: theme.colors.text.secondary,
                  marginLeft: '8px',
                  padding: '2px 6px',
                  background: theme.colors.background.secondary,
                  borderRadius: '10px',
                }}
              >
                {node.children?.length || 0}
              </span>
            )}
          </div>

          {/* Render children if expanded */}
          {hasChildren && isExpanded && (
            <div>{renderTree(node.children || [], nodePath, level + 1)}</div>
          )}
        </div>
      );
    });
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: theme.colors.background.primary,
        border: `1px solid ${theme.colors.border.medium}`,
        borderRadius: '4px',
      }}
    >
      {/* Search bar */}
      <div style={{ padding: '12px', borderBottom: `1px solid ${theme.colors.border.medium}` }}>
        <input
          type="text"
          placeholder="Filter by name, serial no or IP..."
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: '14px',
            color: theme.colors.text.primary,
            background: theme.colors.background.secondary,
            border: `1px solid ${theme.colors.border.medium}`,
            borderRadius: '4px',
            outline: 'none',
            boxSizing: 'border-box',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = theme.colors.primary.border;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = theme.colors.border.medium;
          }}
        />
      </div>

      {/* Tree view */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 0',
        }}
      >
        {treeData.length === 0 ? (
          <div
            style={{
              padding: '20px',
              textAlign: 'center',
              color: theme.colors.text.secondary,
              fontSize: '14px',
            }}
          >
            No data available
          </div>
        ) : (
          renderTree(treeData)
        )}
      </div>
    </div>
  );
};

