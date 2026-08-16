import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { resolveShareLink } from '../api/share.api.js';
import { getLiveJourney, getRouteGeometry } from '../api/trains.api.js';
import { JourneyMap } from '../components/map/JourneyMap.js';
import { StatusPanel } from '../components/journey/StatusPanel.js';
import { ShieldCheck, Train } from 'lucide-react';

export const SharedJourney: React.FC = () => {
  const { shareId = '' } = useParams<{ shareId: string }>();

  const { data: shareLink, isLoading: isShareLoading } = useQuery({
    queryKey: ['resolveShare', shareId],
    queryFn: () => resolveShareLink(shareId),
  });

  const trainId = shareLink?.trainId || '20901';

  const { data: liveStatus } = useQuery({
    queryKey: ['liveJourney', trainId],
    queryFn: () => getLiveJourney(trainId),
    enabled: !!shareLink,
  });

  const { data: routeGeometry } = useQuery({
    queryKey: ['routeGeometry', trainId],
    queryFn: () => getRouteGeometry(trainId),
    enabled: !!shareLink,
  });

  if (isShareLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="skeleton" style={{ width: '60px', height: '60px', borderRadius: '50%' }} />
        <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Loading shared journey tracking session...</p>
      </div>
    );
  }

  if (!shareLink || !liveStatus || !routeGeometry) {
    return (
      <div style={{ maxWidth: '500px', margin: '80px auto', padding: '32px', textAlign: 'center', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800 }}>Invalid or Expired Share Link</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '12px 0 24px' }}>
          This tracking link has expired (24h TTL) or does not exist.
        </p>
        <Link to="/" style={{ backgroundColor: 'var(--accent-primary)', color: '#fff', padding: '10px 20px', borderRadius: 'var(--radius-full)', textDecoration: 'none', fontWeight: 600 }}>
          Go to Home
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      {/* Shared Tracking Banner */}
      <div
        style={{
          backgroundColor: '#0071e3',
          color: '#ffffff',
          padding: '10px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '13px',
          fontWeight: 600,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={16} />
          <span>You are viewing a shared live tracking session for {liveStatus.train.name} ({liveStatus.train.number})</span>
        </div>
        <Link
          to={`/journey/${liveStatus.train.id}`}
          style={{
            backgroundColor: '#ffffff',
            color: '#0071e3',
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '12px',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Track on RailGaadi →
        </Link>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <JourneyMap route={routeGeometry} liveStatus={liveStatus} />
        <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 20 }}>
          <StatusPanel status={liveStatus} route={routeGeometry} onRefresh={() => {}} />
        </div>
      </div>
    </div>
  );
};
