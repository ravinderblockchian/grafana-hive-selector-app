// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { useTheme2 } from '@grafana/ui';

interface FilterDropdownProps {
  label: string;
  icon?: React.ReactNode;
  options?: string[];
  selectedValue?: string;
  onSelect?: (value: string) => void;
  showRemoveButton?: boolean;
  onRemove?: () => void;
  style?: React.CSSProperties;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  icon,
  options = [],
  selectedValue,
  onSelect,
  showRemoveButton = false,
  onRemove,
  style,
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
      },
    };
  }

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (value: string) => {
    onSelect?.(value);
    setIsOpen(false);
  };

  if (showRemoveButton && selectedValue) {
    // Render as a filter tag with remove button
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 8px',
          background: theme.colors.background.secondary,
          border: `1px solid ${theme.colors.border.medium}`,
          borderRadius: '4px',
          fontSize: '14px',
          color: theme.colors.text.primary,
          ...style,
        }}
      >
        {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
        <span>{selectedValue}</span>
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
              display: 'flex',
              alignItems: 'center',
              color: theme.colors.text.secondary,
              fontSize: '16px',
              lineHeight: '1',
            }}
          >
            ×
          </button>
        )}
      </div>
    );
  }

  // Render as a dropdown button
  return (
    <div ref={dropdownRef} style={{ position: 'relative', ...style }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '6px 12px',
          background: theme.colors.background.secondary,
          border: `1px solid ${theme.colors.border.medium}`,
          borderRadius: '4px',
          cursor: 'pointer',
          color: theme.colors.text.primary,
          fontSize: '14px',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.colors.action?.hover || theme.colors.background.primary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = theme.colors.background.secondary;
        }}
      >
        {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
        <span>{label}</span>
        {selectedValue && <span style={{ marginLeft: '4px' }}>({selectedValue})</span>}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            marginLeft: '4px',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        >
          <path
            d="M3 4L6 7L9 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && options.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '4px',
            background: theme.colors.background.primary,
            border: `1px solid ${theme.colors.border.medium}`,
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            zIndex: 1000,
            minWidth: '200px',
            maxHeight: '300px',
            overflowY: 'auto',
          }}
        >
          {options.map((option, index) => (
            <div
              key={index}
              onClick={() => handleSelect(option)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                color: theme.colors.text.primary,
                fontSize: '14px',
                backgroundColor: selectedValue === option ? theme.colors.action.selected : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (selectedValue !== option) {
                  e.currentTarget.style.backgroundColor = theme.colors.action.hover;
                }
              }}
              onMouseLeave={(e) => {
                if (selectedValue !== option) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

