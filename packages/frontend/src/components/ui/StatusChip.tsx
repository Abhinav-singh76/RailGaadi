import React from 'react';
import { Clock, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';

interface StatusChipProps {
  delayMinutes: number;
  hasLiveData?: boolean;
  isStale?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusChip: React.FC<StatusChipProps> = ({
  delayMinutes,
  hasLiveData = true,
  isStale = false,
  size = 'md',
}) => {
  if (!hasLiveData) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: size === 'sm' ? '3px 8px' : '6px 12px',
          borderRadius: 'var(--radius-full)',
          fontSize: size === 'sm' ? '12px' : '13px',
          fontWeight: 600,
          backgroundColor: '#f3f4f6',
          color: '#6b7280',
          border: '1px solid #e5e7eb',
        }}
      >
        <HelpCircle size={size === 'sm' ? 12 : 14} />
        <span>No Live Status</span>
      </span>
    );
  }

  let label = 'On Time';
  let Icon = CheckCircle;
  let bg = 'var(--status-ontime-bg)';
  let color = '#047857';
  let border = '1px solid #a7f3d0';

  if (delayMinutes > 0 && delayMinutes <= 15) {
    label = `${delayMinutes}m Late`;
    Icon = Clock;
    bg = 'var(--status-delayed-bg)';
    color = '#b45309';
    border = '1px solid #fde68a';
  } else if (delayMinutes > 15) {
    label = `${delayMinutes}m Delayed`;
    Icon = AlertTriangle;
    bg = 'var(--status-severe-bg)';
    color = '#b91c1c';
    border = '1px solid #fca5a5';
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: size === 'sm' ? '3px 8px' : '6px 12px',
        borderRadius: 'var(--radius-full)',
        fontSize: size === 'sm' ? '12px' : '13px',
        fontWeight: 600,
        backgroundColor: bg,
        color: color,
        border: border,
      }}
    >
      <Icon size={size === 'sm' ? 12 : 14} />
      <span>{label}</span>
      {isStale && <span style={{ opacity: 0.7, fontSize: '10px' }}>(stale)</span>}
    </span>
  );
};
