// @ts-nocheck
import React from 'react';
import { useTheme2 } from '@grafana/ui';

export const OverviewPage: React.FC = () => {
  let theme;
  try {
    theme = useTheme2();
  } catch (error) {
    console.error('Error getting theme:', error);
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

  const handleOpenDashboard = () => {
    window.location.href = '/a/mindking-site-manager-dashboard?view=dashboard';
  };

  const handleOpenLanding = () => {
    window.location.href = '/a/mindking-site-manager-dashboard';
  };

  return (
    <div
      style={{
        padding: '24px',
        background: theme.colors.background.canvas,
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 500,
            color: theme.colors.text.primary,
            marginBottom: '16px',
          }}
        >
          Site Manager Dashboard
        </h1>

        <p
          style={{
            fontSize: '16px',
            color: theme.colors.text.secondary,
            marginBottom: '32px',
            lineHeight: '1.6',
          }}
        >
          Complete site management dashboard with custom branding, alarm summaries, interactive map, navigation tree, and dynamic panel loading. Full control over layout and UI.
        </p>

        {/* Quick Actions */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              background: theme.colors.background.primary,
              border: `1px solid ${theme.colors.border.medium}`,
              borderRadius: '8px',
              padding: '24px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onClick={handleOpenDashboard}
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
                fontSize: '32px',
                marginBottom: '12px',
                color: theme.colors.primary.main,
              }}
            >
              <i className="gicon gicon-dashboard" />
            </div>
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 500,
                color: theme.colors.text.primary,
                marginBottom: '8px',
              }}
            >
              Open Dashboard
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: theme.colors.text.secondary,
                lineHeight: '1.5',
              }}
            >
              Access the full dashboard with tree navigation, map, alarms, and all features.
            </p>
          </div>

          <div
            style={{
              background: theme.colors.background.primary,
              border: `1px solid ${theme.colors.border.medium}`,
              borderRadius: '8px',
              padding: '24px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onClick={handleOpenLanding}
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
                fontSize: '32px',
                marginBottom: '12px',
                color: theme.colors.primary.main,
              }}
            >
              <i className="gicon gicon-home-alt" />
            </div>
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 500,
                color: theme.colors.text.primary,
                marginBottom: '8px',
              }}
            >
              Landing Page
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: theme.colors.text.secondary,
                lineHeight: '1.5',
              }}
            >
              View available dashboard presets and select a view to get started.
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div
          style={{
            background: theme.colors.background.primary,
            border: `1px solid ${theme.colors.border.medium}`,
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '32px',
          }}
        >
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 500,
              color: theme.colors.text.primary,
              marginBottom: '16px',
            }}
          >
            Features
          </h2>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
            }}
          >
            <li
              style={{
                padding: '12px 0',
                borderBottom: `1px solid ${theme.colors.border.weak}`,
                color: theme.colors.text.secondary,
                fontSize: '14px',
              }}
            >
              <strong style={{ color: theme.colors.text.primary }}>Tree Navigation:</strong> Hierarchical site navigation with search functionality
            </li>
            <li
              style={{
                padding: '12px 0',
                borderBottom: `1px solid ${theme.colors.border.weak}`,
                color: theme.colors.text.secondary,
                fontSize: '14px',
              }}
            >
              <strong style={{ color: theme.colors.text.primary }}>Interactive Map:</strong> Visualize sites on an interactive map with markers
            </li>
            <li
              style={{
                padding: '12px 0',
                borderBottom: `1px solid ${theme.colors.border.weak}`,
                color: theme.colors.text.secondary,
                fontSize: '14px',
              }}
            >
              <strong style={{ color: theme.colors.text.primary }}>Alarm Management:</strong> Real-time alarm summaries with severity indicators
            </li>
            <li
              style={{
                padding: '12px 0',
                borderBottom: `1px solid ${theme.colors.border.weak}`,
                color: theme.colors.text.secondary,
                fontSize: '14px',
              }}
            >
              <strong style={{ color: theme.colors.text.primary }}>Dynamic Panels:</strong> Load predefined panel sets based on site selection
            </li>
            <li
              style={{
                padding: '12px 0',
                color: theme.colors.text.secondary,
                fontSize: '14px',
              }}
            >
              <strong style={{ color: theme.colors.text.primary }}>Custom Branding:</strong> Full control over UI with custom styling
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={handleOpenDashboard}
            style={{
              padding: '12px 24px',
              background: theme.colors.primary.main,
              color: theme.colors.primary.contrastText,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Open Dashboard
          </button>
          <button
            onClick={handleOpenLanding}
            style={{
              padding: '12px 24px',
              background: theme.colors.background.secondary,
              color: theme.colors.text.primary,
              border: `1px solid ${theme.colors.border.medium}`,
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            View Landing Page
          </button>
        </div>
      </div>
    </div>
  );
};

