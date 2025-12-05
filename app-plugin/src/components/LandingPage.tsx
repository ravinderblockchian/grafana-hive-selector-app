// @ts-nocheck
import React from 'react';
import { useTheme2 } from '@grafana/ui';

interface LandingPageProps {
  onViewSelect: (view: 'dashboard' | 'preset') => void;
}

interface ViewPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  panelSet?: string; // Library panel set to load
  url?: string; // Direct URL to navigate to
}

const VIEW_PRESETS: ViewPreset[] = [
  {
    id: 'site-overview',
    name: 'Site Overview',
    description: 'Complete site management dashboard with tree navigation, map, and alarm summaries',
    icon: 'apps',
    panelSet: 'site-overview',
  },
  {
    id: 'detailed-metrics',
    name: 'Detailed Metrics',
    description: 'Comprehensive performance metrics and analytics',
    icon: 'graph-bar',
    panelSet: 'detailed-metrics',
  },
  {
    id: 'alarm-analysis',
    name: 'Alarm Analysis',
    description: 'Alarm trends, severity distribution, and timeline analysis',
    icon: 'bell',
    panelSet: 'alarm-analysis',
  },
  {
    id: 'custom-dashboard',
    name: 'Custom Dashboard',
    description: 'Full dashboard view with all features and custom panel loading',
    icon: 'dashboard',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onViewSelect }) => {
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

  const handlePresetClick = (preset: ViewPreset) => {
    // For now, all options go to dashboard view
    // Panel sets can be configured later when library panels are set up
    onViewSelect('dashboard');
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        background: `linear-gradient(135deg, ${theme.colors.background.canvas} 0%, ${theme.colors.background.secondary} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        overflow: 'auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '60px',
        }}
      >
        <h1
          style={{
            fontSize: '48px',
            fontWeight: 600,
            color: theme.colors.text.primary,
            marginBottom: '16px',
          }}
        >
          Site Manager Dashboard
        </h1>
        <p
          style={{
            fontSize: '18px',
            color: theme.colors.text.secondary,
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          Select a view to get started. Each view can be customized with different panel sets and configurations.
        </p>
      </div>

      {/* View Presets Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          maxWidth: '1200px',
          width: '100%',
        }}
      >
        {VIEW_PRESETS.map((preset) => (
          <div
            key={preset.id}
            onClick={() => handlePresetClick(preset)}
            style={{
              background: theme.colors.background.primary,
              border: `1px solid ${theme.colors.border.medium}`,
              borderRadius: '8px',
              padding: '32px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = theme.shadows.z3;
              e.currentTarget.style.borderColor = theme.colors.primary.main;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = theme.colors.border.medium;
            }}
          >
            <div
              style={{
                fontSize: '48px',
                marginBottom: '16px',
                color: theme.colors.primary.main,
              }}
            >
              <i className={`gicon gicon-${preset.icon}`} />
            </div>
            <h2
              style={{
                fontSize: '24px',
                fontWeight: 500,
                color: theme.colors.text.primary,
                marginBottom: '12px',
              }}
            >
              {preset.name}
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: theme.colors.text.secondary,
                lineHeight: '1.6',
              }}
            >
              {preset.description}
            </p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: '60px',
          textAlign: 'center',
          color: theme.colors.text.secondary,
          fontSize: '14px',
        }}
      >
        <p>Powered by Grafana • Custom Site Management Solution</p>
      </div>
    </div>
  );
};

