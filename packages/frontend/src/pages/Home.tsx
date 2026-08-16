import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Train,
  Star,
  Clock,
  Compass,
  ShieldCheck,
  Zap,
  ArrowRightLeft,
  MapPin,
  Flame,
  CloudSun,
  Navigation,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore.js';
import { TrainCard } from '../components/ui/TrainCard.js';
import { searchTrains, getTrainsBetweenStations } from '../api/trains.api.js';
import { Train as TrainType } from '@railgaadi/types';

export const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'train' | 'stations'>('train');
  const [query, setQuery] = useState('');
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [suggestions, setSuggestions] = useState<TrainType[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const searchBoxRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { recentSearches, favourites } = useAppStore();

  const samplePopularTrains = [
    { number: '20901', name: 'Vande Bharat Express', route: 'Mumbai Central → Gandhinagar' },
    { number: '12951', name: 'Mumbai Rajdhani', route: 'Mumbai Central → New Delhi' },
    { number: '12002', name: 'Bhopal Shatabdi', route: 'New Delhi → Rani Kamlapati' },
    { number: '22436', name: 'Vande Bharat Express', route: 'New Delhi → Varanasi' },
    { number: '12301', name: 'Howrah Rajdhani', route: 'Howrah → New Delhi' },
    { number: '12626', name: 'Kerala Express', route: 'New Delhi → Trivandrum' },
  ];

  const popularStations = [
    { code: 'NDLS', name: 'New Delhi' },
    { code: 'MMCT', name: 'Mumbai Central' },
    { code: 'HWH', name: 'Howrah Junction' },
    { code: 'MAS', name: 'Chennai Central' },
    { code: 'SBC', name: 'KSR Bengaluru' },
    { code: 'ADI', name: 'Ahmedabad' },
  ];

  // Autocomplete live suggestion debounce
  useEffect(() => {
    if (query.trim().length >= 2 && activeTab === 'train') {
      const timer = setTimeout(async () => {
        try {
          setIsSearching(true);
          const results = await searchTrains(query.trim());
          setSuggestions(results.slice(0, 6));
          setShowSuggestions(true);
        } catch (e) {
          console.error(e);
        } finally {
          setIsSearching(false);
        }
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query, activeTab]);

  // Click outside to dismiss suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'train') {
      if (query.trim()) {
        setShowSuggestions(false);
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    } else {
      if (fromStation.trim() && toStation.trim()) {
        navigate(`/search?q=${encodeURIComponent(`${fromStation.trim()} to ${toStation.trim()}`)}`);
      }
    }
  };

  const handleSwapStations = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Hero Banner Section */}
      <section
        style={{
          padding: '60px 20px 48px',
          textAlign: 'center',
          maxWidth: '860px',
          margin: '0 auto',
          position: 'relative',
        }}
      >
        {/* Live GPS badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--accent-light)',
            color: 'var(--accent-primary)',
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            fontSize: '13px',
            fontWeight: 700,
            marginBottom: '20px',
            boxShadow: '0 2px 8px rgba(0, 113, 227, 0.15)',
          }}
        >
          <Zap size={15} />
          <span>Real-Time Indian Railways Live GPS Tracking & Weather</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: 900,
            lineHeight: 1.12,
            color: 'var(--text-primary)',
            letterSpacing: '-1.2px',
            marginBottom: '16px',
          }}
        >
          Track Any Train Across India in <span style={{ color: 'var(--accent-primary)' }}>Live Precision</span>
        </h1>

        <p
          style={{
            fontSize: '18px',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: '36px',
            maxWidth: '680px',
            margin: '0 auto 36px',
          }}
        >
          Instant train running status, delay radar, dark vector route maps, station weather companion, and terrain profiles powered by live RailRadar & OpenWeather APIs.
        </p>

        {/* Search Box Card with Tabs */}
        <div
          ref={searchBoxRef}
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            padding: '8px',
            maxWidth: '680px',
            margin: '0 auto',
            position: 'relative',
          }}
        >
          {/* Tab Selector */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              backgroundColor: 'var(--bg-secondary)',
              padding: '4px',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '12px',
            }}
          >
            <button
              onClick={() => setActiveTab('train')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontWeight: 700,
                backgroundColor: activeTab === 'train' ? 'var(--bg-surface)' : 'transparent',
                color: activeTab === 'train' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                boxShadow: activeTab === 'train' ? 'var(--shadow-sm)' : 'none',
                transition: 'var(--transition-fast)',
                cursor: 'pointer',
              }}
            >
              <Train size={16} />
              <span>Search by Train</span>
            </button>

            <button
              onClick={() => setActiveTab('stations')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontWeight: 700,
                backgroundColor: activeTab === 'stations' ? 'var(--bg-surface)' : 'transparent',
                color: activeTab === 'stations' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                boxShadow: activeTab === 'stations' ? 'var(--shadow-sm)' : 'none',
                transition: 'var(--transition-fast)',
                cursor: 'pointer',
              }}
            >
              <MapPin size={16} />
              <span>Trains Between Stations</span>
            </button>
          </div>

          {/* Tab 1: Train Search Form */}
          {activeTab === 'train' ? (
            <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px 8px 6px 16px',
                }}
              >
                <Search size={22} color="var(--text-tertiary)" style={{ marginRight: '12px', flexShrink: 0 }} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true);
                  }}
                  placeholder="Enter 5-digit train number or name (e.g. 20901, Vande Bharat, Rajdhani)..."
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    fontSize: '16px',
                    color: 'var(--text-primary)',
                    backgroundColor: 'transparent',
                    fontFamily: 'inherit',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: '#ffffff',
                    padding: '12px 26px',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 700,
                    fontSize: '15px',
                    transition: 'var(--transition-fast)',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0, 113, 227, 0.3)',
                    flexShrink: 0,
                  }}
                >
                  Track Live
                </button>
              </div>

              {/* Autocomplete Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    right: 0,
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-xl)',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    zIndex: 50,
                    textAlign: 'left',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ padding: '8px 16px', fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', borderBottom: '1px solid var(--bg-secondary)' }}>
                    Matching Trains
                  </div>
                  {suggestions.map((st) => (
                    <div
                      key={st.id}
                      onClick={() => {
                        setShowSuggestions(false);
                        navigate(`/journey/${st.number}`);
                      }}
                      style={{
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        borderBottom: '1px solid var(--bg-secondary)',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent-primary)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: 700 }}>
                          {st.number}
                        </span>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>{st.name}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                        {st.originCode} → {st.destinationCode}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </form>
          ) : (
            /* Tab 2: Station-to-Station Form */
            <form
              onSubmit={handleSearchSubmit}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 6px',
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  flex: 1,
                  minWidth: '180px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--bg-secondary)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <MapPin size={18} color="var(--accent-primary)" />
                <input
                  type="text"
                  value={fromStation}
                  onChange={(e) => setFromStation(e.target.value)}
                  placeholder="From Station (e.g. NDLS, Mumbai)"
                  style={{
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    width: '100%',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <button
                type="button"
                onClick={handleSwapStations}
                title="Swap stations"
                style={{
                  padding: '10px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                }}
              >
                <ArrowRightLeft size={16} />
              </button>

              <div
                style={{
                  flex: 1,
                  minWidth: '180px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--bg-secondary)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <MapPin size={18} color="var(--status-ontime)" />
                <input
                  type="text"
                  value={toStation}
                  onChange={(e) => setToStation(e.target.value)}
                  placeholder="To Station (e.g. MMCT, Varanasi)"
                  style={{
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    width: '100%',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: '#ffffff',
                  padding: '12px 24px',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0, 113, 227, 0.3)',
                }}
              >
                Find Trains
              </button>
            </form>
          )}
        </div>

        {/* Popular Quick Badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-tertiary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Flame size={14} color="#f59e0b" /> Popular:
          </span>
          {samplePopularTrains.map((st) => (
            <button
              key={st.number}
              onClick={() => navigate(`/journey/${st.number}`)}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'var(--transition-fast)',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--accent-primary)';
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)';
              }}
            >
              #{st.number} ({st.name})
            </button>
          ))}
        </div>
      </section>

      {/* Main Content Sections */}
      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {/* Recent Searches Section */}
        {recentSearches.length > 0 && (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={20} color="var(--accent-primary)" />
                <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Recent Searches</h2>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {recentSearches.map((train) => (
                <TrainCard key={train.id} train={train} />
              ))}
            </div>
          </section>
        )}

        {/* Favourites Section */}
        {favourites.length > 0 && (
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Star size={20} color="#f59e0b" fill="#f59e0b" />
              <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Favourite Trains</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {favourites.map((train) => (
                <TrainCard key={train.id} train={train} />
              ))}
            </div>
          </section>
        )}

        {/* Live Features Showcase Grid */}
        <section>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Engineered for Seamless Railway Travel
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Comprehensive real-time insights powered by live railway and weather sensors.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                padding: '24px',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--accent-light)',
                  color: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <Train size={22} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>Live Maplibre & MapTiler Radar</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Real-time train positioning marker on high-performance vector dark maps with polyline route tracks.
              </p>
            </div>

            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                padding: '24px',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#ecfdf5',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <CloudSun size={22} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>3-Station Weather Companion</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Simultaneously displays current station, upcoming ETA station, and final destination weather via OpenWeather.
              </p>
            </div>

            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                padding: '24px',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#fef3c7',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <Compass size={22} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>OpenTopo Elevation & Surroundings</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Topographic rail track elevation chart, mountain passes, historic river bridges, and nearby monuments.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
