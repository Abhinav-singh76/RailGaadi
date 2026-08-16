import React from 'react';
import { Link } from 'react-router-dom';
import { Train } from '@railgaadi/types';
import { Star, ArrowRight, Clock, MapPin } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.js';

interface TrainCardProps {
  train: Train;
}

export const TrainCard: React.FC<TrainCardProps> = ({ train }) => {
  const { toggleFavourite, isFavourite } = useAppStore();
  const favourite = isFavourite(train.id);

  const handleStarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavourite(train);
  };

  return (
    <Link
      to={`/journey/${train.id}`}
      style={{
        display: 'block',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'var(--transition-bounce)',
        position: 'relative',
        textDecoration: 'none',
        color: 'inherit',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                backgroundColor: 'var(--accent-light)',
                color: 'var(--accent-primary)',
                fontWeight: 700,
                fontSize: '12px',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                letterSpacing: '0.5px',
              }}
            >
              {train.number}
            </span>
            <span
              style={{
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '11px',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {train.trainType}
            </span>
          </div>
          <h3
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginTop: '6px',
            }}
          >
            {train.name}
          </h3>
        </div>

        <button
          onClick={handleStarClick}
          aria-label={favourite ? 'Remove from favourites' : 'Add to favourites'}
          style={{
            padding: '8px',
            borderRadius: '50%',
            backgroundColor: favourite ? '#fff7ed' : 'var(--bg-secondary)',
            color: favourite ? '#f59e0b' : 'var(--text-tertiary)',
            transition: 'var(--transition-fast)',
          }}
        >
          <Star size={18} fill={favourite ? '#f59e0b' : 'none'} />
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '14px', marginTop: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
          <MapPin size={14} color="var(--accent-primary)" />
          <span>{train.origin} ({train.originCode})</span>
        </div>
        <ArrowRight size={14} color="var(--text-tertiary)" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
          <MapPin size={14} color="var(--status-ontime)" />
          <span>{train.destination} ({train.destinationCode})</span>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: '1px solid var(--bg-secondary)',
          fontSize: '13px',
          color: 'var(--text-tertiary)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={13} />
          {Math.floor(train.expectedDurationMinutes / 60)}h {train.expectedDurationMinutes % 60}m
        </span>
        <span>{train.totalDistanceKm} km</span>
        <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>Track Live →</span>
      </div>
    </Link>
  );
};
