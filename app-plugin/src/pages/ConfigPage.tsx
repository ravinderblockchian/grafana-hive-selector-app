// @ts-nocheck
import React, { useState } from 'react';
import { useTheme2 } from '@grafana/ui';

export const ConfigPage: React.FC = () => {
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
  const [treeData, setTreeData] = useState(
    localStorage.getItem('site-manager-tree-data') || ''
  );
  const [devicesData, setDevicesData] = useState(
    localStorage.getItem('site-manager-devices-data') || ''
  );

  const handleSave = () => {
    localStorage.setItem('site-manager-tree-data', treeData);
    localStorage.setItem('site-manager-devices-data', devicesData);
    alert('Configuration saved!');
  };

  return (
    <div
      style={{
        padding: '24px',
        background: theme.colors.background.canvas,
        minHeight: '100vh',
      }}
    >
      <h1
        style={{
          fontSize: '24px',
          fontWeight: 500,
          color: theme.colors.text.primary,
          marginBottom: '24px',
        }}
      >
        Site Manager Configuration
      </h1>

      <div
        style={{
          background: theme.colors.background.primary,
          border: `1px solid ${theme.colors.border.medium}`,
          borderRadius: '4px',
          padding: '24px',
          marginBottom: '24px',
        }}
      >
        <label
          style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 500,
            color: theme.colors.text.primary,
            marginBottom: '8px',
          }}
        >
          Tree Data (JSON)
        </label>
        <textarea
          value={treeData}
          onChange={(e) => setTreeData(e.target.value)}
          style={{
            width: '100%',
            minHeight: '200px',
            padding: '8px',
            fontFamily: 'monospace',
            fontSize: '12px',
            background: theme.colors.background.secondary,
            border: `1px solid ${theme.colors.border.medium}`,
            borderRadius: '4px',
            color: theme.colors.text.primary,
          }}
          placeholder="Paste your tree structure JSON here..."
        />
      </div>

      <div
        style={{
          background: theme.colors.background.primary,
          border: `1px solid ${theme.colors.border.medium}`,
          borderRadius: '4px',
          padding: '24px',
          marginBottom: '24px',
        }}
      >
        <label
          style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 500,
            color: theme.colors.text.primary,
            marginBottom: '8px',
          }}
        >
          Devices Data (JSON - Optional)
        </label>
        <textarea
          value={devicesData}
          onChange={(e) => setDevicesData(e.target.value)}
          style={{
            width: '100%',
            minHeight: '150px',
            padding: '8px',
            fontFamily: 'monospace',
            fontSize: '12px',
            background: theme.colors.background.secondary,
            border: `1px solid ${theme.colors.border.medium}`,
            borderRadius: '4px',
            color: theme.colors.text.primary,
          }}
          placeholder="Paste your devices array JSON here (optional)..."
        />
      </div>

      <button
        onClick={handleSave}
        style={{
          padding: '10px 20px',
          background: theme.colors.primary.main,
          color: theme.colors.primary.contrastText,
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 500,
        }}
      >
        Save Configuration
      </button>
    </div>
  );
};

