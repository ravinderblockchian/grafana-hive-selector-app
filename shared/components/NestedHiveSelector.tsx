// @ts-nocheck
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useTheme2 } from '@grafana/ui';
import { TreeNode } from '../types';
import { SEVERITY_CONFIG } from '../constants';

export interface NestedHiveSelectorProps {
  treeData: TreeNode[];
  labelText?: string;
  selectedValue?: string | null;
  selectedPath?: string[];
  onSelectionChange?: (value: string, path: string[], nodeValue?: string) => void;
  onClear?: () => void;
  width?: string;
  dropdownPosition?: 'below' | 'above';
}

export const NestedHiveSelector: React.FC<NestedHiveSelectorProps> = ({
  treeData,
  labelText = "Site/Group",
  selectedValue: controlledSelectedValue,
  selectedPath: controlledSelectedPath,
  onSelectionChange,
  onClear,
  width = '350px',
  dropdownPosition = 'below',
}) => {
  const theme = useTheme2();

  // Use controlled or uncontrolled state
  const [internalSelectedValue, setInternalSelectedValue] = useState<string | null>(null);
  const [internalSelectedPath, setInternalSelectedPath] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const selectedValue = controlledSelectedValue !== undefined ? controlledSelectedValue : internalSelectedValue;
  const selectedPath = controlledSelectedPath !== undefined ? controlledSelectedPath : internalSelectedPath;

  const dropdownRef = useRef(null);

  // Find the selected node from treeData to get its icon
  const findSelectedNode = (nodes: TreeNode[], path: string[]): TreeNode | null => {
    if (path.length === 0) return null;
    
    for (const node of nodes) {
      if (node.name === path[0]) {
        if (path.length === 1) {
          return node;
        }
        if (node.children) {
          return findSelectedNode(node.children, path.slice(1));
        }
      }
    }
    return null;
  };

  const selectedNode = useMemo(() => {
    if (selectedPath.length === 0) return null;
    return findSelectedNode(treeData, selectedPath);
  }, [selectedPath, treeData]);

  // Close dropdown if clicked outside (only when dropdown is open)
  useEffect(() => {
    if (!dropdownOpen) return;
    
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // Auto-expand parents when dropdown opens (only if something is selected)
  useEffect(() => {
    if (!dropdownOpen || selectedPath.length === 0) return;

    const newExpanded = {};
    for (let i = 0; i < selectedPath.length; i++) {
      const key = selectedPath.slice(0, i + 1).join("|");
      newExpanded[key] = true;
    }

    setExpanded(prev => ({ ...prev, ...newExpanded }));
  }, [dropdownOpen, selectedPath]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (dropdownOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [dropdownOpen]);

  // Search functionality - find all matching nodes with their full paths
  interface SearchResult {
    node: TreeNode;
    path: string[];
    matchType: 'group' | 'subgroup' | 'node';
    matchIndex: number; // Index in path where match occurred (0=group, 1=subgroup, 2+=node)
  }

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    const query = searchQuery.toLowerCase().trim();
    const results: SearchResult[] = [];

    // Recursive function to search through the tree
    const searchTree = (nodes: TreeNode[], path: string[] = []) => {
      for (const node of nodes) {
        const nodePath = [...path, node.name];
        const nodeNameLower = node.name.toLowerCase();
        
        // Check if this node matches
        if (nodeNameLower.includes(query)) {
          const isGroup = path.length === 0;
          const isSubgroup = path.length === 1;
          const isNode = !node.children || node.children.length === 0;
          
          let matchType: 'group' | 'subgroup' | 'node';
          if (isGroup) {
            matchType = 'group';
          } else if (isSubgroup) {
            matchType = 'subgroup';
          } else {
            matchType = 'node';
          }

          results.push({
            node,
            path: nodePath,
            matchType,
            matchIndex: path.length,
          });
        }

        // Continue searching in children
        if (node.children && node.children.length > 0) {
          searchTree(node.children, nodePath);
        }
      }
    };

    searchTree(treeData);

    // Sort results: groups first, then subgroups, then nodes
    // Within each category, sort by match position (exact matches first)
    return results.sort((a, b) => {
      // First, sort by match type priority
      const typeOrder = { group: 0, subgroup: 1, node: 2 };
      if (typeOrder[a.matchType] !== typeOrder[b.matchType]) {
        return typeOrder[a.matchType] - typeOrder[b.matchType];
      }

      // Then sort by match quality (exact match > starts with > contains)
      const aName = a.node.name.toLowerCase();
      const bName = b.node.name.toLowerCase();
      const aExact = aName === query ? 0 : aName.startsWith(query) ? 1 : 2;
      const bExact = bName === query ? 0 : bName.startsWith(query) ? 1 : 2;
      if (aExact !== bExact) {
        return aExact - bExact;
      }

      // Finally, sort alphabetically
      return a.node.name.localeCompare(b.node.name);
    });
  }, [searchQuery, treeData]);

  // Get severity config
  const getSeverityConfig = (severity: number | undefined | null) => {
    if (severity === undefined || severity === null || severity < 0 || severity > 5) {
      return null;
    }
    return SEVERITY_CONFIG[severity as keyof typeof SEVERITY_CONFIG] || null;
  };

  // Render severity icon
  const renderSeverityIcon = (severity: number | undefined, nodeIcon?: string) => {
    let iconUrl: string | null = null;
    
    if (nodeIcon && typeof nodeIcon === 'string' && nodeIcon.trim() !== '') {
      iconUrl = nodeIcon;
    } else {
      const config = getSeverityConfig(severity);
      if (config && config.icon) {
        iconUrl = config.icon;
      }
    }
    
    if (!iconUrl) {
      return null;
    }

    return (
      <img 
        src={iconUrl} 
        alt="severity icon"
        style={{ 
          width: 16, 
          height: 16,
          marginRight: '8px',
          flexShrink: 0,
          display: 'inline-block',
          verticalAlign: 'middle',
        }} 
        onError={(e) => {
          console.error('[ICON ERROR] Failed to load icon from:', iconUrl);
          e.currentTarget.style.border = '2px solid red';
          e.currentTarget.style.backgroundColor = '#ffcccc';
          e.currentTarget.alt = 'ICON ERROR';
        }}
      />
    );
  };

  // Render severity badge
  const renderSeverityBadge = (severity: number | undefined) => {
    const config = getSeverityConfig(severity);
    if (!config) return null;

    return (
      <span
        style={{
          fontSize: '11px',
          color: config.color,
          fontWeight: 500,
          marginLeft: 'auto',
          padding: '2px 6px',
          borderRadius: '3px',
          backgroundColor: `${config.color}20`,
        }}
      >
        {config.label}
      </span>
    );
  };

  // Recursive renderer
  const renderTree = (nodes: TreeNode[], path: string[] = [], level = 0) => {
    if (!nodes || nodes.length === 0) {
      return null;
    }
    
    return nodes.map((node, index) => {
      const nodePath = [...path, node.name];
      const key = nodePath.join("|");
      const isParent = node.children && node.children.length > 0;
      const isExpanded = expanded[key] || false;
      
      return (
        <div key={key}>
          <div
            style={{
              padding: "8px 12px",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              paddingLeft: `${level * 20 + 12}px`,
              backgroundColor: selectedPath.join("|") === key ? theme.colors.action.selected : 'transparent',
              minHeight: '32px',
            }}
            onMouseEnter={(e) => {
              if (selectedPath.join("|") !== key) {
                e.currentTarget.style.backgroundColor = theme.colors.action.hover;
              }
            }}
            onMouseLeave={(e) => {
              if (selectedPath.join("|") !== key) {
                e.currentTarget.style.backgroundColor = 'transparent';
              } else {
                e.currentTarget.style.backgroundColor = theme.colors.action.selected;
              }
            }}
            onClick={(e) => {
              e.stopPropagation();

              if (isParent) {
                setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
                return;
              }

              // Leaf node selection
              if (controlledSelectedValue === undefined) {
                setInternalSelectedValue(node.name);
                setInternalSelectedPath(nodePath);
              }
              setDropdownOpen(false);

              if (onSelectionChange) {
                onSelectionChange(node.name, nodePath, node.value);
              }
            }}
          >
            {/* Arrow indicator for parents */}
            {isParent ? (
              <span
                style={{
                  marginRight: 10,
                  fontSize: "10px",
                  userSelect: "none",
                  width: 14,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: theme.colors.text.secondary,
                }}
              >
                {isExpanded ? "▼" : "▶"}
              </span>
            ) : (
              <span style={{ width: 24, marginRight: 0, display: "inline-block" }}></span>
            )}

            {/* Severity Icon */}
            {(() => {
              const nodeWithIcon = node as any;
              return renderSeverityIcon(node.maxAlarmSeverity, nodeWithIcon.icon);
            })()}

            {/* Node Name */}
            <span style={{ 
              fontSize: 14, 
              color: theme.colors.text.primary,
              lineHeight: '1.5',
              flex: 1,
            }}>
              {node.name}
            </span>

            {/* Severity Badge */}
            {renderSeverityBadge(node.maxAlarmSeverity)}
          </div>

          {/* Render children if parent is expanded */}
          {isParent && isExpanded && (
            <div>{renderTree(node.children, nodePath, level + 1)}</div>
          )}
        </div>
      );
    }); 
  };

  const handleClear = () => {
    if (controlledSelectedValue === undefined) {
      setInternalSelectedValue(null);
      setInternalSelectedPath([]);
    }
    setExpanded({});
    setSearchQuery('');
    setDropdownOpen(false);
    if (onClear) {
      onClear();
    }
  };

  return (
    <div
      style={{
        position: "relative",
        display: 'inline-block',
        width: width,
      }}
      ref={dropdownRef}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          background: 'transparent',
          border: `1px solid ${theme.colors.border.medium}`,
          borderRadius: '4px',
          height: '32px',
          paddingRight: selectedPath.length > 0 ? '32px' : '12px',
          width: '100%',
          boxSizing: 'border-box',
          cursor: 'pointer',
        }}
        onClick={(e) => {
          e.stopPropagation();
          setDropdownOpen(!dropdownOpen);
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = theme.colors.border.strong;
          e.currentTarget.style.backgroundColor = theme.colors.action.hover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = theme.colors.border.medium;
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <span style={{ 
          fontSize: '14px', 
          color: theme.colors.text.primary,
          fontWeight: 400,
          padding: '0',
          marginRight: '8px',
        }}>
          {labelText} |
        </span>
        {selectedValue && (
          <span style={{ 
            fontSize: '14px',
            color: theme.colors.text.primary,
            flex: 1,
            marginRight: selectedPath.length > 0 ? '12px' : '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            {selectedNode && (selectedNode as any).icon && (
              <img 
                src={(selectedNode as any).icon} 
                alt="severity icon"
                style={{ 
                  width: 16, 
                  height: 16,
                  flexShrink: 0,
                  display: 'block',
                }}
              />
            )}
            {selectedValue}
          </span>
        )}
        {!selectedValue && (
          <span style={{ 
            fontSize: '12px', 
            color: theme.colors.text.secondary,
            marginLeft: 'auto',
          }}>
            ▼
          </span>
        )}
        {selectedValue && (
          <span style={{ 
            fontSize: '12px', 
            color: theme.colors.text.secondary,
            marginLeft: 'auto',
            marginRight: '24px',
          }}>
            ▼
          </span>
        )}
      </div>
      {selectedPath.length > 0 && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            handleClear();
          }}
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            cursor: 'pointer',
            fontSize: '18px',
            color: theme.colors.text.secondary,
            padding: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '18px',
            height: '18px',
            borderRadius: '2px',
            zIndex: 2,
            lineHeight: '1',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.action.hover;
            e.currentTarget.style.color = theme.colors.text.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = theme.colors.text.secondary;
          }}
          title="Clear selection"
        >
          ×
        </span>
      )}

      {dropdownOpen && (
        <div
          style={{
            position: "absolute",
            [dropdownPosition === 'below' ? 'top' : 'bottom']: dropdownPosition === 'below' ? 'calc(100% + 4px)' : 'calc(100% + 4px)',
            left: 0,
            width: width,
            maxHeight: 450,
            overflowY: "auto",
            background: theme.colors.background.secondary,
            border: `1px solid ${theme.colors.border.medium}`,
            borderRadius: 4,
            padding: "4px 0",
            boxShadow: theme.shadows.z3,
            zIndex: 9999,
          }}
        >
          {/* Search Bar */}
          <div style={{ padding: '8px', borderBottom: `1px solid ${theme.colors.border.medium}` }}>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search groups, sub-groups, nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Escape') {
                  setSearchQuery('');
                  setDropdownOpen(false);
                }
              }}
              style={{
                width: '100%',
                padding: '6px 12px',
                fontSize: '14px',
                color: theme.colors.text.primary,
                background: theme.colors.background.primary,
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

          {/* Search Results or Tree */}
          {treeData.length === 0 ? (
            <div style={{ padding: '12px', color: theme.colors.text.secondary }}>
              No tree data available.
            </div>
          ) : searchQuery.trim() ? (
            // Show search results
            <div>
              {searchResults.length === 0 ? (
                <div style={{ padding: '12px', color: theme.colors.text.secondary, textAlign: 'center' }}>
                  No results found for "{searchQuery}"
                </div>
              ) : (
                searchResults.map((result, index) => {
                  const key = result.path.join("|");
                  const isLeaf = !result.node.children || result.node.children.length === 0;
                  
                  return (
                    <div
                      key={`${key}-${index}`}
                      style={{
                        padding: "8px 12px",
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                        backgroundColor: selectedPath.join("|") === key ? theme.colors.action.selected : 'transparent',
                        minHeight: '32px',
                      }}
                      onMouseEnter={(e) => {
                        if (selectedPath.join("|") !== key) {
                          e.currentTarget.style.backgroundColor = theme.colors.action.hover;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedPath.join("|") !== key) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        } else {
                          e.currentTarget.style.backgroundColor = theme.colors.action.selected;
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        
                        if (!isLeaf) {
                          // For non-leaf nodes, expand/collapse in tree view
                          setSearchQuery('');
                          setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
                          return;
                        }

                        // Leaf node selection
                        if (controlledSelectedValue === undefined) {
                          setInternalSelectedValue(result.node.name);
                          setInternalSelectedPath(result.path);
                        }
                        setSearchQuery('');
                        setDropdownOpen(false);

                        if (onSelectionChange) {
                          onSelectionChange(result.node.name, result.path, result.node.value);
                        }
                      }}
                    >
                      {/* Severity Icon */}
                      {(() => {
                        const nodeWithIcon = result.node as any;
                        return renderSeverityIcon(result.node.maxAlarmSeverity, nodeWithIcon.icon);
                      })()}

                      {/* Full Path Display */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ 
                          fontSize: 14, 
                          color: theme.colors.text.primary,
                          lineHeight: '1.4',
                          fontWeight: 500,
                        }}>
                          {result.node.name}
                        </span>
                        {result.path.length > 1 && (
                          <span style={{ 
                            fontSize: 12, 
                            color: theme.colors.text.secondary,
                            lineHeight: '1.3',
                          }}>
                            {result.path.slice(0, -1).join(' > ')}
                          </span>
                        )}
                      </div>

                      {/* Severity Badge */}
                      {renderSeverityBadge(result.node.maxAlarmSeverity)}
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            // Show normal tree view
            renderTree(treeData)
          )}
        </div>
      )}
    </div>
  );
};

