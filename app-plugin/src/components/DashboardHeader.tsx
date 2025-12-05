// @ts-nocheck
import React from 'react';
import { useTheme2 } from '@grafana/ui';
import { SEVERITY_CONFIG } from '../../../shared/constants';
import arrowLeftIcon from '../../img/icons/arrow-left.svg';

interface DashboardHeaderProps {
  alarmCounts: {
    critical: number;
    major: number;
    minor: number;
    warning: number;
    info?: number;
    normal?: number;
  };
  onBack?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  alarmCounts,
  onBack,
}) => {
  let theme;
  try {
    theme = useTheme2();
  } catch (error) {
    theme = {
      colors: {
        background: { canvas: '#0b0c0e', primary: '#1f1f1f', secondary: '#2d2d2d' },
        text: { primary: '#ffffff', secondary: '#b7b7b7' },
        border: { medium: '#3d3d3d', weak: '#2d2d2d' },
        primary: { main: '#3274d9', contrastText: '#ffffff' },
      },
    };
  }

  const severityItems = [
    { severity: 5, count: alarmCounts.critical, label: 'Critical' },
    { severity: 4, count: alarmCounts.major, label: 'Major' },
    { severity: 3, count: alarmCounts.minor, label: 'Minor' },
    { severity: 2, count: alarmCounts.warning, label: 'Warning' },
    { severity: 0, count: alarmCounts.info || 0, label: 'Info' },
    { severity: 1, count: alarmCounts.normal || 0, label: 'Normal' },
  ];

  return (
    <div
      style={{
        background: theme.colors.background.primary,
        borderBottom: `1px solid ${theme.colors.border.medium}`,
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        minHeight: '48px',
      }}
    >
      {/* Left side - Back button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              color: theme.colors.text.primary,
              fontSize: '14px',
            }}
          >
            <img
              src={arrowLeftIcon}
              alt="back"
              style={{ 
                width: '16px', 
                height: '16px', 
                marginRight: '4px',
                filter: `brightness(0) saturate(100%) invert(${theme.isDark ? '1' : '0'})`,
              }}
            />
            Dashboards
          </button>
        )}
      </div>

      {/* Right side - Alarm severity icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {severityItems.map((item) => {
          const config = SEVERITY_CONFIG[item.severity as keyof typeof SEVERITY_CONFIG];
          if (!config) return null;

          return (
            <div
              key={item.severity}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.background.secondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {config.icon && (
                <img
                  src={config.icon}
                  alt={config.label}
                  style={{
                    width: '16px',
                    height: '16px',
                    flexShrink: 0,
                    // Don't invert alarm severity icons - they should be colorful
                  }}
                />
              )}
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: theme.colors.text.primary,
                  minWidth: '20px',
                  textAlign: 'right',
                }}
              >
                {item.count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

