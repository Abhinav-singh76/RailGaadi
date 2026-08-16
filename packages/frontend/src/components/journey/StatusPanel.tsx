import React, { useState } from 'react';
import { LiveJourneyStatus, RouteGeometry } from '@railgaadi/types';
import { StatusChip } from '../ui/StatusChip.js';
import { AnimatedCounter } from '../ui/AnimatedCounter.js';
import { RefreshCw, Share2, MapPin, Navigation, Clock, Check, Copy } from 'lucide-react';
import { createShareLink } from '../../api/share.api.js';

interface StatusPanelProps {
  status: LiveJourneyStatus;
  route: RouteGeometry | null;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const StatusPanel: React.FC<StatusPanelProps> = ({
  status,
  route,
  onRefresh,
  isRefreshing = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    try {
      setSharing(true);
      const share = await createShareLink(status.id, status.trainId);
      await navigator.clipboard.writeText(share.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      console.error(e);
      alert('Failed to generate share link');
    } finally {
      setSharing(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '24px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        boxShadow: 'var(--shadow-lg)',
        width: '100%',
        maxWidth: '480px',
      }}
    >
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                backgroundColor: 'var(--accent-light)',
                color: 'var(--accent-primary)',
                fontWeight: 700,
                fontSize: '13px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {status.train.number}
            </span>
            <StatusChip delayMinutes={status.delayMinutes} hasLiveData={status.hasLiveData} isStale={status.isStale} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, marginTop: '8px', color: 'var(--text-primary)' }}>
            {status.train.name}
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh Live Status"
            style={{
              padding: '10px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              transition: 'var(--transition-fast)',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={18} className={isRefreshing ? 'pulse-marker' : ''} />
          </button>

          <button
            onClick={handleShare}
            disabled={sharing}
            title="Share Journey"
            style={{
              padding: '10px',
              borderRadius: '50%',
              backgroundColor: copied ? '#ecfdf5' : 'var(--accent-light)',
              color: copied ? '#10b981' : 'var(--accent-primary)',
              transition: 'var(--transition-fast)',
              cursor: 'pointer',
            }}
          >
            {copied ? <Check size={18} /> : <Share2 size={18} />}
          </button>
        </div>
      </div>

      {copied && (
        <div
          style={{
            backgroundColor: '#ecfdf5',
            color: '#047857',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Copy size={14} />
          <span>Live tracking link copied to clipboard! Share with family and friends.</span>
        </div>
      )}

      {/* Progress Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
          <span>Journey Completion</span>
          <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>
            <AnimatedCounter value={status.completionPercentage} suffix="%" />
          </span>
        </div>
        <div
          style={{
            width: '100%',
            height: '10px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${status.completionPercentage}%`,
              background: 'linear-gradient(90deg, #0071e3 0%, #0284c7 100%)',
              borderRadius: 'var(--radius-full)',
              transition: 'width 800ms ease-out',
            }}
          />
        </div>
      </div>

      {/* Current & Next Station */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div
          style={{
            backgroundColor: 'var(--bg-primary)',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(0, 0, 0, 0.04)',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            Current / Last Station
          </span>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
            {status.currentStation.station.name}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Code: {status.currentStation.station.code} • PF {status.currentStation.platform}
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--accent-light)',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(0, 113, 227, 0.1)',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
            Next Station (ETA)
          </span>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
            {status.nextStation.station.name}
          </div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-primary)', marginTop: '2px' }}>
            ETA: {status.nextStation.actualArrival || status.nextStation.scheduledArrival}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', textAlign: 'center' }}>
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Covered</span>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
            <AnimatedCounter value={status.distanceCoveredKm} suffix=" km" />
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Remaining</span>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
            <AnimatedCounter value={status.distanceRemainingKm} suffix=" km" />
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Speed</span>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '2px' }}>
            <AnimatedCounter value={status.position.speedKmph} suffix=" km/h" />
          </div>
        </div>
      </div>

      {/* Status Description & Timestamp */}
      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        <p style={{ fontWeight: 500 }}>{status.statusText}</p>
        <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '6px' }}>
          Last updated: {new Date(status.lastUpdated).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};
