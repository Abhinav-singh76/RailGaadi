import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { RouteGeometry, LiveJourneyStatus } from '@railgaadi/types';
import { LocateFixed, Eye, Layers, Compass, ZoomIn, ZoomOut } from 'lucide-react';

interface JourneyMapProps {
  route: RouteGeometry;
  liveStatus: LiveJourneyStatus | null;
}

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY || 'dYX7aAT5X4iq8yGETdW6';

// MapTiler Dataviz Dark vector map style with fallback to CARTO Dark Matter
const DARK_MAP_STYLE: string | maplibregl.StyleSpecification = MAPTILER_KEY
  ? `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${MAPTILER_KEY}`
  : {
      version: 8,
      sources: {
        'carto-dark': {
          type: 'raster',
          tiles: ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'],
          tileSize: 256,
          attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
        },
      },
      layers: [
        {
          id: 'carto-dark-layer',
          type: 'raster',
          source: 'carto-dark',
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    };

export const JourneyMap: React.FC<JourneyMapProps> = ({ route, liveStatus }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const trainMarkerRef = useRef<maplibregl.Marker | null>(null);
  const [followTrain, setFollowTrain] = useState(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const initialCenter: [number, number] = liveStatus
      ? [liveStatus.position.longitude, liveStatus.position.latitude]
      : route.coordinates[0] || [72.8193, 18.9696];

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: DARK_MAP_STYLE,
      center: initialCenter,
      zoom: 8,
      pitch: 35,
      bearing: 0,
    });

    mapRef.current = map;

    map.on('load', () => {
      // 1. Add Full Route Source
      map.addSource('route-line', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: route.coordinates,
          },
        },
      });

      // Remaining Route Line (Dashed Muted)
      map.addLayer({
        id: 'route-remaining',
        type: 'line',
        source: 'route-line',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#4b5563',
          'line-width': 4,
          'line-dasharray': [2, 2],
        },
      });

      // Completed Route Line (Bright Blue Glowing)
      if (liveStatus) {
        // Calculate completed portion coordinates
        const passedCoords = route.coordinates.slice(0, Math.floor(route.coordinates.length * (liveStatus.completionPercentage / 100)) + 1);
        passedCoords.push([liveStatus.position.longitude, liveStatus.position.latitude]);

        map.addSource('route-completed', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: passedCoords,
            },
          },
        });

        map.addLayer({
          id: 'route-completed-layer',
          type: 'line',
          source: 'route-completed',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#0071e3',
            'line-width': 6,
          },
        });
      }

      // Add Station Point Markers
      route.stations.forEach((st) => {
        const el = document.createElement('div');
        el.className = 'station-marker';
        const isCurrent = liveStatus?.currentStation.station.code === st.station.code;

        el.style.width = isCurrent ? '16px' : '10px';
        el.style.height = isCurrent ? '16px' : '10px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = isCurrent ? '#10b981' : '#ffffff';
        el.style.border = isCurrent ? '3px solid #ffffff' : '2px solid #6b7280';
        el.style.boxShadow = isCurrent ? '0 0 10px rgba(16, 185, 129, 0.8)' : 'none';

        new maplibregl.Marker({ element: el })
          .setLngLat([st.station.longitude, st.station.latitude])
          .setPopup(
            new maplibregl.Popup({ offset: 10 }).setHTML(
              `<strong style="color:#111827;">${st.station.name} (${st.station.code})</strong><br/><span style="color:#6b7280;font-size:12px;">Distance: ${st.distanceFromOriginKm} km</span>`
            )
          )
          .addTo(map);
      });

      // Fit map camera bounds to the train's entire route
      if (route.coordinates.length > 1) {
        const bounds = new maplibregl.LngLatBounds(route.coordinates[0], route.coordinates[0]);
        route.coordinates.forEach((coord) => bounds.extend(coord));
        map.fitBounds(bounds, { padding: { top: 60, bottom: 60, left: 60, right: 60 }, maxZoom: 12 });
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [route]);

  // Update Train Position Marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !liveStatus) return;

    const coords: [number, number] = [liveStatus.position.longitude, liveStatus.position.latitude];

    if (!trainMarkerRef.current) {
      const el = document.createElement('div');
      el.className = 'pulse-marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = '#0071e3';
      el.style.border = '3px solid #ffffff';
      el.style.boxShadow = '0 0 15px rgba(0, 113, 227, 0.9)';
      el.style.cursor = 'pointer';

      trainMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat(coords)
        .addTo(map);
    } else {
      trainMarkerRef.current.setLngLat(coords);
    }

    if (followTrain) {
      map.flyTo({
        center: coords,
        zoom: 9.5,
        speed: 1.2,
      });
    }
  }, [liveStatus, followTrain]);

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleResetCamera = () => {
    if (liveStatus && mapRef.current) {
      mapRef.current.flyTo({
        center: [liveStatus.position.longitude, liveStatus.position.latitude],
        zoom: 9,
        pitch: 35,
      });
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '400px' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, bottom: 0 }} />

      {/* Floating Map Controls */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          backgroundColor: 'rgba(17, 24, 39, 0.85)',
          backdropFilter: 'blur(12px)',
          padding: '6px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <button
          onClick={() => setFollowTrain(!followTrain)}
          title={followTrain ? 'Following train' : 'Follow train'}
          style={{
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: followTrain ? '#0071e3' : 'transparent',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'var(--transition-fast)',
          }}
        >
          <LocateFixed size={18} />
        </button>

        <button
          onClick={handleZoomIn}
          title="Zoom In"
          style={{
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ZoomIn size={18} />
        </button>

        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          style={{
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ZoomOut size={18} />
        </button>

        <button
          onClick={handleResetCamera}
          title="Reset Camera"
          style={{
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Compass size={18} />
        </button>
      </div>

      {/* Map Live Legend */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          zIndex: 10,
          backgroundColor: 'rgba(17, 24, 39, 0.85)',
          backdropFilter: 'blur(12px)',
          padding: '10px 16px',
          borderRadius: 'var(--radius-md)',
          color: '#ffffff',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0071e3', display: 'inline-block' }}></span>
          <span>Live Train Location</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '3px', backgroundColor: '#0071e3', display: 'inline-block' }}></span>
          <span>Covered Route</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '3px', backgroundColor: '#4b5563', borderStyle: 'dashed', display: 'inline-block' }}></span>
          <span>Remaining Route</span>
        </div>
      </div>
    </div>
  );
};
