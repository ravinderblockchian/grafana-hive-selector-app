// @ts-nocheck
/**
 * Panel Set Selector Component
 * Provides UI buttons to dynamically load library panel sets
 */

import React, { useState } from 'react';
import { useTheme2 } from '@grafana/ui';
import { addPredefinedPanelSet, getAvailableLibraryPanels, PREDEFINED_PANEL_SETS } from '../utils/libraryPanelControl';

interface PanelSetSelectorProps {
  onPanelSetAdded?: (setName: string) => void;
}

export const PanelSetSelector: React.FC<PanelSetSelectorProps> = ({ onPanelSetAdded }) => {
  const theme = useTheme2();
  const [loading, setLoading] = useState<string | null>(null);
  const [availableSets] = useState<Array<{ name: string; set: any }>>(
    Object.entries(PREDEFINED_PANEL_SETS).map(([key, set]) => ({ name: key, set }))
  );

  const handleAddPanelSet = async (setName: string) => {
    setLoading(setName);
    try {
      const success = await addPredefinedPanelSet(setName);
      if (success) {
        console.log(`Successfully added panel set: ${setName}`);
        onPanelSetAdded?.(setName);
      } else {
        console.error(`Failed to add panel set: ${setName}`);
      }
    } catch (error) {
      console.error(`Error adding panel set ${setName}:`, error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div
      style={{
        padding: '16px',
        background: theme.colors.background.secondary,
        borderRadius: '4px',
        border: `1px solid ${theme.colors.border.medium}`,
      }}
    >
      <h3
        style={{
          fontSize: '16px',
          fontWeight: 500,
          color: theme.colors.text.primary,
          marginBottom: '12px',
        }}
      >
        Add Panel Sets
      </h3>
      <p
        style={{
          fontSize: '14px',
          color: theme.colors.text.secondary,
          marginBottom: '16px',
        }}
      >
        Click a button below to add a pre-configured set of library panels to the dashboard.
      </p>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        {availableSets.map(({ name, set }) => (
          <button
            key={name}
            onClick={() => handleAddPanelSet(name)}
            disabled={loading === name}
            style={{
              padding: '8px 16px',
              background: loading === name 
                ? theme.colors.action.disabledBackground 
                : theme.colors.primary.main,
              color: theme.colors.primary.contrastText,
              border: 'none',
              borderRadius: '4px',
              cursor: loading === name ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              opacity: loading === name ? 0.6 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            {loading === name ? 'Adding...' : set.name}
          </button>
        ))}
      </div>
      {availableSets.length === 0 && (
        <p
          style={{
            fontSize: '14px',
            color: theme.colors.text.secondary,
            fontStyle: 'italic',
          }}
        >
          No panel sets configured. Please configure panel sets in the plugin settings.
        </p>
      )}
    </div>
  );
};

