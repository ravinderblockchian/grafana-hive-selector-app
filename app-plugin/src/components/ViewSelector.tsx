// @ts-nocheck
/**
 * View Selector Component
 * Allows users to select a predefined view (appliance type) like generator, power system, etc.
 */

import React, { useState, useEffect } from 'react';
import { useTheme2 } from '@grafana/ui';

export interface ViewOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  panelSet: string; // Library panel set to load
}

export const DEFAULT_VIEWS: ViewOption[] = [
  {
    id: 'generator',
    name: 'Generator',
    description: 'Generator metrics and status',
    icon: 'bolt',
    panelSet: 'generator-metrics',
  },
  {
    id: 'power-system',
    name: 'Power System',
    description: 'Power system metrics and analysis',
    icon: 'plug',
    panelSet: 'power-system-metrics',
  },
  {
    id: 'cooling',
    name: 'Cooling System',
    description: 'Cooling system metrics and status',
    icon: 'snowflake',
    panelSet: 'cooling-metrics',
  },
  {
    id: 'network',
    name: 'Network',
    description: 'Network metrics and connectivity',
    icon: 'network',
    panelSet: 'network-metrics',
  },
  {
    id: 'overview',
    name: 'Overview',
    description: 'General site overview and summary',
    icon: 'apps',
    panelSet: 'site-overview',
  },
];

interface ViewSelectorProps {
  selectedView?: string | null;
  onViewSelect: (viewId: string) => void;
  views?: ViewOption[];
  disabled?: boolean;
}

export const ViewSelector: React.FC<ViewSelectorProps> = ({
  selectedView,
  onViewSelect,
  views = DEFAULT_VIEWS,
  disabled = false,
}) => {
  const theme = useTheme2();
  const [isOpen, setIsOpen] = useState(false);

  const selectedViewOption = views.find((v) => v.id === selectedView) || views[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.view-selector-container')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="view-selector-container" style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        style={{
          padding: '8px 16px',
          background: theme.colors.background.secondary,
          border: `1px solid ${theme.colors.border.medium}`,
          borderRadius: '4px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          color: theme.colors.text.primary,
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          minWidth: '200px',
          justifyContent: 'space-between',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className={`gicon gicon-${selectedViewOption.icon}`} style={{ fontSize: '16px' }} />
          <span>{selectedViewOption.name}</span>
        </div>
        <i className={`gicon gicon-${isOpen ? 'angle-up' : 'angle-down'}`} style={{ fontSize: '12px' }} />
      </button>

      {isOpen && !disabled && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '4px',
            background: theme.colors.background.primary,
            border: `1px solid ${theme.colors.border.medium}`,
            borderRadius: '4px',
            boxShadow: theme.shadows.z3,
            zIndex: 1000,
            minWidth: '250px',
            maxHeight: '400px',
            overflowY: 'auto',
          }}
        >
          {views.map((view) => (
            <div
              key={view.id}
              onClick={() => {
                onViewSelect(view.id);
                setIsOpen(false);
              }}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                borderBottom: `1px solid ${theme.colors.border.weak}`,
                background:
                  selectedView === view.id
                    ? theme.colors.background.secondary
                    : 'transparent',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                if (selectedView !== view.id) {
                  e.currentTarget.style.background = theme.colors.background.secondary;
                }
              }}
              onMouseLeave={(e) => {
                if (selectedView !== view.id) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <div
                style={{
                  fontSize: '20px',
                  color: selectedView === view.id ? theme.colors.primary.main : theme.colors.text.secondary,
                  marginTop: '2px',
                }}
              >
                <i className={`gicon gicon-${view.icon}`} />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: selectedView === view.id ? 500 : 400,
                    color: theme.colors.text.primary,
                    marginBottom: '4px',
                  }}
                >
                  {view.name}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: theme.colors.text.secondary,
                    lineHeight: '1.4',
                  }}
                >
                  {view.description}
                </div>
              </div>
              {selectedView === view.id && (
                <div style={{ color: theme.colors.primary.main, marginTop: '2px' }}>
                  <i className="gicon gicon-check" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

