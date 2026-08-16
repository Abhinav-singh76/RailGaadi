import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getLiveJourney, getRouteGeometry } from '../api/trains.api.js';
import { JourneyMap } from '../components/map/JourneyMap.js';
import { StatusPanel } from '../components/journey/StatusPanel.js';
import { useAppStore } from '../store/useAppStore.js';
import { Map, BarChart3, Compass, List, AlertTriangle, RefreshCw } from 'lucide-react';

export const Journey: React.FC = () => {
  const { trainId = '20901' } = useParams<{ trainId: string }>();
  const [activeTab, setActiveTab] = useState<'map' | 'timeline'>('map');
  const { addRecentSearch } = useAppStore();

  // Poll live journey data every 60 seconds
  const {
    data: liveStatus,
    isLoading: isLiveLoading,
    isError: isLiveError,
    refetch: refetchLive,
    isFetching: isLiveFetching,
  } = useQuery({
    queryKey: ['liveJourney', trainId],
    queryFn: () => getLiveJourney(trainId),
    refetchInterval: 60000,
  });

  // Fetch route geometry (long cache)
  const { data: routeGeometry, isLoading: isRouteLoading } = useQuery({
    queryKey: ['routeGeometry', trainId],
    queryFn: () => getRouteGeometry(trainId),
  });

  useEffect(() => {
    if (liveStatus?.train) {
      addRecentSearch(liveStatus.train);
    }
  }, [liveStatus, addRecentSearch]);

  if (isLiveLoading || isRouteLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: '16px' }}>
        <div className="skeleton" style={{ width: '80px', height: '80px', borderRadius: '50%' }} />
        <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Loading live journey data for train #{trainId}...</p>
      </div>
    );
  }

  if (isLiveError || !liveStatus || !routeGeometry) {
    return (
      <div style={{ maxWidth: '600px', margin: '60px auto', padding: '32px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', textAlign: 'center', border: '1px solid rgba(0,0,0,0.08)' }}>
        <AlertTriangle size={40} color="var(--status-severe)" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '22px', fontWeight: 800 }}>Live Tracking Unavailable</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '8px 0 24px' }}>
          Could not fetch live updates for train #{trainId}. The train service might be inactive or live radar server failed.
        </p>
        <button
          onClick={() => refetchLive()}
          style={{
            backgroundColor: 'var(--accent-primary)',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 'var(--radius-full)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      {/* Secondary Navigation Subheader */}
      <div
        style={{
          height: '48px',
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('map')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: activeTab === 'map' ? 'var(--accent-light)' : 'transparent',
              color: activeTab === 'map' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            }}
          >
            <Map size={15} /> Live Map View
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: activeTab === 'timeline' ? 'var(--accent-light)' : 'transparent',
              color: activeTab === 'timeline' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            }}
          >
            <List size={15} /> Station Timeline ({routeGeometry.stations.length})
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link
            to={`/analytics/${trainId}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
            }}
          >
            <BarChart3 size={15} /> Journey Analytics
          </Link>
          <Link
            to={`/explore/${trainId}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
            }}
          >
            <Compass size={15} /> Weather & POIs
          </Link>
        </div>
      </div>

      {/* Main split area */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        {/* Map Layer */}
        <div style={{ flex: 1, height: '100%', position: 'relative' }}>
          <JourneyMap route={routeGeometry} liveStatus={liveStatus} />
        </div>

        {/* Side Panel (Desktop) / Sheet (Mobile) */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            zIndex: 20,
            maxHeight: 'calc(100% - 40px)',
            overflowY: 'auto',
          }}
        >
          {activeTab === 'map' ? (
            <StatusPanel
              status={liveStatus}
              route={routeGeometry}
              onRefresh={() => refetchLive()}
              isRefreshing={isLiveFetching}
            />
          ) : (
            <div
              style={{
                width: '440px',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-xl)',
                padding: '24px',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid rgba(0,0,0,0.06)',
                maxHeight: 'calc(100vh - 140px)',
                overflowY: 'auto',
              }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>Route Station Timeline</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
                {routeGeometry.stations.map((st, idx) => (
                  <div key={st.stationId} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: st.status === 'passed' ? '#10b981' : st.status === 'current' ? '#0071e3' : '#d1d5db',
                        marginTop: '4px',
                        flexShrink: 0,
                        border: st.status === 'current' ? '3px solid #e0f2fe' : 'none',
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
                          {st.station.name} ({st.station.code})
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{st.distanceFromOriginKm} km</span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Sch: {st.scheduledArrival || st.scheduledDeparture || 'Start'} • Actual: {st.actualArrival || st.actualDeparture || 'On Time'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
