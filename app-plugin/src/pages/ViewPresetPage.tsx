// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useTheme2 } from '@grafana/ui';
import { addPredefinedPanelSet } from '../utils/libraryPanelControl';
import { parseURLParams } from '../utils/urlParams';

export const ViewPresetPage: React.FC = () => {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [panelSetName, setPanelSetName] = useState<string | null>(null);

  useEffect(() => {
    // Get panel set from URL
    const params = new URLSearchParams(window.location.search);
    const panelSet = params.get('panelSet');
    
    // Also check URL params for addPanelSet
    const urlParams = parseURLParams();
    const addPanelSet = urlParams.addPanelSet || panelSet;

    if (addPanelSet) {
      setPanelSetName(addPanelSet);
      
      // Extract variable overrides from URL
      const variableOverrides: Record<string, string> = {};
      if (urlParams.updateVariable) {
        variableOverrides[urlParams.updateVariable.name] = urlParams.updateVariable.value;
      }
      if (urlParams.selectedSite) {
        variableOverrides.site = urlParams.selectedSite;
      }

      // Add the panel set
      addPredefinedPanelSet(addPanelSet, Object.keys(variableOverrides).length > 0 ? variableOverrides : undefined)
        .then((success) => {
          setLoading(false);
          if (!success) {
            setError(`Failed to load panel set: ${addPanelSet}`);
          }
        })
        .catch((err) => {
          setLoading(false);
          setError(`Error loading panel set: ${err.message}`);
        });
    } else {
      setLoading(false);
      setError('No panel set specified. Please provide a panelSet parameter in the URL.');
    }
  }, []);

  if (loading) {
    return (
      <div
        style={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: theme.colors.background.canvas,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: '24px',
              marginBottom: '16px',
              color: theme.colors.text.primary,
            }}
          >
            Loading panel set...
          </div>
          <div
            style={{
              fontSize: '14px',
              color: theme.colors.text.secondary,
            }}
          >
            {panelSetName && `Loading: ${panelSetName}`}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: theme.colors.background.canvas,
        }}
      >
        <div
          style={{
            textAlign: 'center',
            padding: '32px',
            background: theme.colors.background.primary,
            border: `1px solid ${theme.colors.border.medium}`,
            borderRadius: '8px',
            maxWidth: '500px',
          }}
        >
          <div
            style={{
              fontSize: '24px',
              marginBottom: '16px',
              color: theme.colors.error.main,
            }}
          >
            Error
          </div>
          <div
            style={{
              fontSize: '14px',
              color: theme.colors.text.secondary,
              marginBottom: '24px',
            }}
          >
            {error}
          </div>
          <button
            onClick={() => window.location.href = '/a/mindking-site-manager-dashboard'}
            style={{
              padding: '8px 16px',
              background: theme.colors.primary.main,
              color: theme.colors.primary.contrastText,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Success - panels should be loaded, show a message or redirect
  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.colors.background.canvas,
      }}
    >
      <div
        style={{
          textAlign: 'center',
          padding: '32px',
          background: theme.colors.background.primary,
          border: `1px solid ${theme.colors.border.medium}`,
          borderRadius: '8px',
          maxWidth: '500px',
        }}
      >
        <div
          style={{
            fontSize: '24px',
            marginBottom: '16px',
            color: theme.colors.success.main,
          }}
        >
          Panel Set Loaded
        </div>
        <div
          style={{
            fontSize: '14px',
            color: theme.colors.text.secondary,
            marginBottom: '24px',
          }}
        >
          {panelSetName && `Successfully loaded: ${panelSetName}`}
          <br />
          The panels should now be visible in your dashboard.
        </div>
        <button
          onClick={() => window.location.href = '/a/mindking-site-manager-dashboard/dashboard'}
          style={{
            padding: '8px 16px',
            background: theme.colors.primary.main,
            color: theme.colors.primary.contrastText,
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

