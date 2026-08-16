import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchTrains, getTrainsBetweenStations } from '../api/trains.api.js';
import { TrainCard } from '../components/ui/TrainCard.js';
import { useAppStore } from '../store/useAppStore.js';
import { Search, Train, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const rawQuery = searchParams.get('q') || '';
  const navigate = useNavigate();
  const { addRecentSearch } = useAppStore();

  const isBetweenSearch = rawQuery.includes(' to ');
  const [fromCode, toCode] = isBetweenSearch ? rawQuery.split(' to ') : ['', ''];

  const {
    data: trains = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['searchTrains', rawQuery],
    queryFn: async () => {
      if (isBetweenSearch && fromCode && toCode) {
        return getTrainsBetweenStations(fromCode.trim(), toCode.trim());
      }
      return searchTrains(rawQuery.trim());
    },
    enabled: rawQuery.length > 0,
  });

  useEffect(() => {
    if (trains.length === 1) {
      addRecentSearch(trains[0]);
    }
  }, [trains, addRecentSearch]);

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '40px 20px 60px' }}>
      <button
        onClick={() => navigate('/')}
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
          cursor: 'pointer',
        }}
      >
        <ArrowLeft size={16} /> Back to Search
      </button>

      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Search Results for "{rawQuery}"
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {isLoading ? 'Searching live railway network database...' : `Found ${trains.length} matching train(s)`}
          </p>
        </div>

        <button
          onClick={() => refetch()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="skeleton"
              style={{ height: '180px', borderRadius: 'var(--radius-lg)' }}
            />
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div
          style={{
            backgroundColor: 'var(--status-severe-bg)',
            color: '#b91c1c',
            padding: '24px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid #fca5a5',
            textAlign: 'center',
          }}
        >
          <AlertCircle size={32} style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Search Service Notice</h3>
          <p style={{ fontSize: '14px', marginTop: '4px' }}>
            {(error as Error)?.message || 'Could not connect to train provider. Please try again.'}
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && trains.length === 0 && (
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            padding: '48px 24px',
            borderRadius: 'var(--radius-xl)',
            textAlign: 'center',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Search size={28} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
            No trains found for "{rawQuery}"
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '440px', margin: '8px auto 24px' }}>
            Please check the train number or try searching for major trains like "20901", "12951", "12002", "Vande Bharat", "Rajdhani", or "Shatabdi".
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: '#ffffff',
              padding: '10px 20px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Try Another Search
          </button>
        </div>
      )}

      {/* Results List */}
      {!isLoading && !isError && trains.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {trains.map((train) => (
            <TrainCard key={train.id} train={train} />
          ))}
        </div>
      )}
    </div>
  );
};
