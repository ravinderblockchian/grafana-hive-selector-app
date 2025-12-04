// @ts-nocheck
import React from 'react';
import { useTheme2 } from '@grafana/ui';

interface AlarmSummaryCardsProps {
  critical?: number;
  major?: number;
  minor?: number;
  warning?: number;
}

export const AlarmSummaryCards: React.FC<AlarmSummaryCardsProps> = ({
  critical = 0,
  major = 0,
  minor = 0,
  warning = 0,
}) => {
  const theme = useTheme2();

  const cards = [
    {
      label: 'Total Critical Alarms',
      value: critical,
      color: '#E02F44',
      bgColor: '#E02F4420',
    },
    {
      label: 'Total Major Alarms',
      value: major,
      color: '#F79520',
      bgColor: '#F7952020',
    },
    {
      label: 'Total Minor Alarms',
      value: minor,
      color: '#FADE2A',
      bgColor: '#FADE2A20',
    },
    {
      label: 'Total Warning Alarms',
      value: warning,
      color: '#A352CC',
      bgColor: '#A352CC20',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}
    >
      {cards.map((card) => (
        <div
          key={card.label}
          style={{
            background: theme.colors.background.secondary,
            border: `1px solid ${theme.colors.border.medium}`,
            borderRadius: '4px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '120px',
          }}
        >
          <div
            style={{
              fontSize: '14px',
              color: theme.colors.text.secondary,
              marginBottom: '12px',
              textAlign: 'center',
            }}
          >
            {card.label}
          </div>
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: card.color,
              lineHeight: '1',
            }}
          >
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
};

