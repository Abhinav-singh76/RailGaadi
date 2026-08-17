import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getJourneyAnalytics } from '../api/trains.api.js';
import { AnimatedCounter } from '../components/ui/AnimatedCounter.js';
import { BarChart3, TrendingUp, Mountain, Clock, MapPin, ArrowLeft } from 'lucide-react';

export const Analytics: React.FC = () => {
  const { trainId = '20901' } = useParams<{ trainId: string }>();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['journeyAnalytics', trainId],
    queryFn: () => getJourneyAnalytics(trainId),
  });

  if (isLoading || !analytics) {
    return (
      <div style={{ maxWidth: '1000px', margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <div className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-xl)' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '40px 20px 60px' }}>
      <Link
        to={`/journey/${trainId}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'var(--bg-secondary)',
          padding: '8px 14px',
          borderRadius: 'var(--radius-full)',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          marginBottom: '24px',
          textDecoration: 'none',
        }}
      >
        <ArrowLeft size={16} /> Back to Live Tracking
      </Link>

      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', fontWeight: 700, fontSize: '13px' }}>
          <BarChart3 size={16} />
          <span>JOURNEY INTELLIGENCE & ELEVATION</span>
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
          Journey Analytics & Route Profile
        </h1>
      </div>

      {/* Top Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Completion</span>
          <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '4px' }}>
            <AnimatedCounter value={analytics.completionPercentage} suffix="%" />
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {analytics.distanceCoveredKm} km of {analytics.totalDistanceKm} km completed
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Delay Status</span>
          <div style={{ fontSize: '36px', fontWeight: 800, color: analytics.delayMinutes > 0 ? '#b45309' : '#047857', marginTop: '4px' }}>
            <AnimatedCounter value={analytics.delayMinutes} suffix=" mins" />
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={14} color="#10b981" /> Delay trend: {analytics.delayTrend}
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Peak Speed</span>
          <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            <AnimatedCounter value={analytics.topSpeedKmph} suffix=" km/h" />
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Avg speed: {analytics.averageSpeedKmph} km/h
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Highest Altitude</span>
          <div style={{ fontSize: '36px', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>
            <AnimatedCounter value={analytics.highestElevationMeters} suffix=" m" />
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Mountain size={14} /> At {analytics.highestElevationPoint?.locationName}
          </div>
        </div>
      </div>

      {/* Elevation Profile Visual Chart */}
      <section style={{ backgroundColor: 'var(--bg-surface)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'var(--shadow-sm)', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Route Elevation Profile (OpenTopoGraphy)</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Terrain elevation across railway track distance</p>
          </div>
          <div style={{ fontSize: '12px', backgroundColor: 'var(--accent-light)', color: 'var(--accent-primary)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}>
            Peak: {analytics.highestElevationMeters}m
          </div>
        </div>

        {/* SVG Elevation Chart */}
        <div style={{ width: '100%', height: '180px', position: 'relative' }}>
          <svg width="100%" height="100%" viewBox="0 0 800 180" preserveAspectRatio="none">
            <defs>
              <linearGradient id="elevationGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0071e3" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0071e3" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d={`M 0,180 L 0,${180 - (analytics.elevationProfile[0]?.elevationMeters || 10) * 1.5} ${analytics.elevationProfile
                .map((p, i) => `L ${(i / (analytics.elevationProfile.length - 1)) * 800},${180 - Math.min(p.elevationMeters * 1.6, 160)}`)
                .join(' ')} L 800,180 Z`}
              fill="url(#elevationGrad)"
            />
            <path
              d={`M 0,${180 - (analytics.elevationProfile[0]?.elevationMeters || 10) * 1.5} ${analytics.elevationProfile
                .map((p, i) => `L ${(i / (analytics.elevationProfile.length - 1)) * 800},${180 - Math.min(p.elevationMeters * 1.6, 160)}`)
                .join(' ')}`}
              fill="none"
              stroke="#0071e3"
              strokeWidth="3"
            />
          </svg>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px 16px',
            fontSize: '12px',
            color: 'var(--text-tertiary)',
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          {analytics.elevationProfile.map((p, idx) => (
            <div
              key={idx}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.stationName}</span>
              <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>({p.elevationMeters}m)</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
