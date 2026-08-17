import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getRouteContext, getJourneyWeather, getLiveJourney } from '../api/trains.api.js';
import { Compass, CloudSun, MapPin, Landmark, Trees, Wind, Droplets, ArrowLeft, Navigation, Flag, Sun, CloudRain } from 'lucide-react';
import { StationWeather } from '@railgaadi/types';

export const Explore: React.FC = () => {
  const { trainId = '20901' } = useParams<{ trainId: string }>();

  const { data: journeyWeather, isLoading: isWeatherLoading } = useQuery({
    queryKey: ['journeyWeather', trainId],
    queryFn: () => getJourneyWeather(trainId),
  });

  // Get live position first, then use real coordinates for context
  const { data: liveStatus } = useQuery({
    queryKey: ['liveJourney', trainId],
    queryFn: () => getLiveJourney(trainId),
    staleTime: 60_000,
  });

  const lat = liveStatus?.position?.latitude ?? 19.076;
  const lng = liveStatus?.position?.longitude ?? 72.877;

  const { data: context, isLoading: isContextLoading } = useQuery({
    queryKey: ['routeContext', trainId, Math.round(lat * 10), Math.round(lng * 10)],
    queryFn: () => getRouteContext(lat, lng),
  });

  if (isWeatherLoading || isContextLoading || !context) {
    return (
      <div style={{ maxWidth: '1080px', margin: '60px auto', padding: '0 20px' }}>
        <div className="skeleton" style={{ height: '280px', borderRadius: 'var(--radius-xl)', marginBottom: '24px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          <div className="skeleton" style={{ height: '200px', borderRadius: 'var(--radius-xl)' }} />
          <div className="skeleton" style={{ height: '200px', borderRadius: 'var(--radius-xl)' }} />
          <div className="skeleton" style={{ height: '200px', borderRadius: 'var(--radius-xl)' }} />
        </div>
      </div>
    );
  }

  const { geography, places } = context;

  const renderWeatherCard = (stationWeather: StationWeather, badgeBg: string, badgeColor: string, badgeLabel: string, icon: React.ReactNode) => {
    const { weather } = stationWeather;
    return (
      <div
        key={stationWeather.stationCode}
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span
              style={{
                backgroundColor: badgeBg,
                color: badgeColor,
                fontWeight: 700,
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {icon}
              {badgeLabel}
            </span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)' }}>
              ({stationWeather.stationCode})
            </span>
          </div>

          <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
            {stationWeather.stationName}
          </h3>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '12px' }}>
            <span style={{ fontSize: '38px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {weather.temperatureC}°C
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Feels like {weather.feelsLikeC}°C
            </span>
          </div>

          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-primary)', marginTop: '4px' }}>
            {weather.weatherCondition}
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            marginTop: '20px',
            paddingTop: '14px',
            borderTop: '1px solid var(--bg-secondary)',
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Humidity</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              {weather.humidityPercentage}%
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Wind</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              {weather.windSpeedKmph} km/h
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Rain</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-primary)', marginTop: '2px' }}>
              {weather.rainForecastPercent}%
            </div>
          </div>
        </div>
      </div>
    );
  };

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
          <Compass size={16} />
          <span>SMART TRAVEL COMPANION</span>
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
          Weather Companion & Route Surroundings
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '6px' }}>
          Real-time weather insights for your current location, upcoming station, and final destination.
        </p>
      </div>

      {/* 3-Station Weather Companion Grid */}
      {journeyWeather && (
        <section style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <CloudSun size={22} color="var(--accent-primary)" />
            <h2 style={{ fontSize: '22px', fontWeight: 800 }}>Journey Weather Companion</h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
            }}
          >
            {renderWeatherCard(
              journeyWeather.currentStationWeather,
              '#ecfdf5',
              '#047857',
              'Current Station',
              <MapPin size={12} />
            )}

            {renderWeatherCard(
              journeyWeather.nextStationWeather,
              'var(--accent-light)',
              'var(--accent-primary)',
              'Next Station (ETA)',
              <Navigation size={12} />
            )}

            {renderWeatherCard(
              journeyWeather.destinationStationWeather,
              '#fef3c7',
              '#b45309',
              'Final Destination',
              <Flag size={12} />
            )}
          </div>
        </section>
      )}

      {/* Geography Section */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Trees size={20} color="var(--status-ontime)" />
          <h2 style={{ fontSize: '22px', fontWeight: 800 }}>Geographic Features Along Route</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {geography.map((geo) => (
            <div
              key={geo.id}
              style={{
                backgroundColor: 'var(--bg-surface)',
                padding: '20px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--status-ontime)', backgroundColor: '#ecfdf5', padding: '3px 8px', borderRadius: 'var(--radius-sm)', textTransform: 'uppercase' }}>
                {geo.type}
              </span>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginTop: '8px' }}>{geo.name}</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>{geo.description}</p>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} /> {geo.distanceFromRouteKm} km from rail track
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Nearby Attractions */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Landmark size={20} color="var(--accent-primary)" />
          <h2 style={{ fontSize: '22px', fontWeight: 800 }}>Monuments & Nearby Attractions</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {places.map((place) => (
            <div
              key={place.id}
              style={{
                backgroundColor: 'var(--bg-surface)',
                padding: '20px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-primary)', backgroundColor: 'var(--accent-light)', padding: '3px 8px', borderRadius: 'var(--radius-sm)', textTransform: 'uppercase' }}>
                {place.category}
              </span>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginTop: '8px' }}>{place.name}</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>{place.description}</p>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>★ {place.rating} Rating</span>
                <span>{place.distanceFromStationKm} km from station</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
