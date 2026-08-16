import { IRailProvider } from './provider.interface.js';
import { MockRailProvider } from './mock.provider.js';
import { OpenWeatherProvider } from './openweather.provider.js';
import {
  Train,
  LiveJourneyStatus,
  RouteGeometry,
  JourneyAnalytics,
  WeatherInfo,
  JourneyWeatherCompanion,
  TravelCompanionContext,
  StationEvent,
  Station,
} from '@railgaadi/types';

// ─── RailRadar actual API response types ─────────────────────────────────────

interface RRStop {
  sequence: number;
  stationCode: string;
  stationName: string;
  isHalt: boolean;
  status: 'departed' | 'at-station' | 'not-departed';
  distance: number;
  scheduledArrival?: string;
  scheduledDeparture?: string;
  actualArrival?: string;
  actualDeparture?: string;
  delayArrival?: number;
  delayDeparture?: number;
  platform?: string;
  speedToNextStationKmph?: number;
  lat?: number;
  lng?: number;
}

interface RRRouteStop {
  sequence: number;
  code: string;
  name: string;
  lat: number;
  lng: number;
}

// ─────────────────────────────────────────────────────────────────────────────

export class RailRadarProvider implements IRailProvider {
  name = 'RailRadarLiveProvider';
  private apiKey: string;
  private fallback: MockRailProvider;
  private weather: OpenWeatherProvider;
  private base = 'https://api.railradar.in/v1';

  // Cache full lookup map (train number → name) for fast search
  private lookupCache: Record<string, string> | null = null;
  private lookupFetchedAt = 0;
  private requestCache = new Map<string, { data: any; timestamp: number }>();
  private inFlight = new Map<string, Promise<any>>();
  private lastRequestTime = 0;
  private readonly MIN_REQUEST_INTERVAL_MS = 250;

  constructor() {
    this.apiKey = process.env.RAILRADAR_API_KEY || 'rg_28e6a44d86e44304bf8a0fd8b23527c0';
    this.fallback = new MockRailProvider();
    this.weather = new OpenWeatherProvider();
  }

  private headers(): HeadersInit {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'x-api-key': this.apiKey,
      Accept: 'application/json',
    };
  }

  private formatTime(val?: string | null): string | null {
    if (!val) return null;
    const str = String(val).trim();
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(str)) {
      return str.slice(0, 5);
    }
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    return str;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async get<T = any>(path: string, retries = 2): Promise<T | null> {
    const isLive = path.includes('/live');
    const ttl = isLive ? 30 * 1000 : 60 * 60 * 1000; // 30s for live, 1 hour for static routes/timetable

    // 1. Check in-memory cache
    const cached = this.requestCache.get(path);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data as T;
    }

    // 2. Reuse in-flight requests to prevent duplicate requests
    if (this.inFlight.has(path)) {
      try {
        return (await this.inFlight.get(path)) as T;
      } catch {
        // continue to fetch
      }
    }

    const fetchPromise = (async () => {
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          // Throttle requests so we never burst over the rate limit
          const now = Date.now();
          const elapsed = now - this.lastRequestTime;
          if (elapsed < this.MIN_REQUEST_INTERVAL_MS) {
            await this.sleep(this.MIN_REQUEST_INTERVAL_MS - elapsed);
          }
          this.lastRequestTime = Date.now();

          const res = await fetch(`${this.base}${path}`, { headers: this.headers() });
          
          if (res.status === 429) {
            console.warn(`[RailRadar] Rate limit 429 on ${path}, attempt ${attempt + 1}/${retries + 1}`);
            if (cached) {
              return cached.data as T;
            }
            if (attempt < retries) {
              await this.sleep(1200 * (attempt + 1));
              continue;
            }
            return null;
          }

          if (!res.ok) {
            console.warn(`[RailRadar] ${path} → HTTP ${res.status}`);
            return cached ? (cached.data as T) : null;
          }

          const body = await res.json();
          if (!body.success) {
            console.warn(`[RailRadar] ${path} → API error: ${body.error?.message}`);
            return cached ? (cached.data as T) : null;
          }

          this.requestCache.set(path, { data: body.data, timestamp: Date.now() });
          return body.data as T;
        } catch (e: any) {
          console.warn(`[RailRadar] ${path} → network error: ${e.message}`);
          if (attempt < retries) {
            await this.sleep(800 * (attempt + 1));
            continue;
          }
          return cached ? (cached.data as T) : null;
        }
      }
      return cached ? (cached.data as T) : null;
    })();

    this.inFlight.set(path, fetchPromise);
    try {
      return await fetchPromise;
    } finally {
      this.inFlight.delete(path);
    }
  }

  // ── Train type inference ───────────────────────────────────────────────────
  private trainType(name: string, type?: string): Train['trainType'] {
    const s = `${name} ${type || ''}`.toLowerCase();
    if (s.includes('vande bharat')) return 'Vande Bharat';
    if (s.includes('rajdhani')) return 'Rajdhani';
    if (s.includes('shatabdi') || s.includes('tejas')) return 'Shatabdi';
    if (s.includes('superfast') || s.includes(' sf ') || s.includes('duronto')) return 'Superfast';
    return 'Express';
  }

  // ── Map a RailRadar `train` object → our Train interface ──────────────────
  private mapTrain(t: any, num: string): Train {
    return {
      id: String(t.number || num),
      number: String(t.number || num),
      name: t.name || `Express #${num}`,
      origin: t.source?.name || 'Origin Station',
      originCode: t.source?.code || 'SRC',
      destination: t.destination?.name || 'Destination Station',
      destinationCode: t.destination?.code || 'DST',
      totalDistanceKm: t.distance || 800,
      expectedDurationMinutes: t.duration || 600,
      trainType: this.trainType(t.name || '', t.type || ''),
    };
  }

  // ── Fetch and cache the full 13k train lookup ─────────────────────────────
  private async getLookup(): Promise<Record<string, string>> {
    const now = Date.now();
    if (this.lookupCache && now - this.lookupFetchedAt < 3_600_000) {
      return this.lookupCache;
    }
    const data = await this.get<Record<string, string>>('/lookup/trains');
    if (data) {
      this.lookupCache = data;
      this.lookupFetchedAt = now;
      return data;
    }
    return {};
  }

  // ── SEARCH TRAINS ─────────────────────────────────────────────────────────
  async searchTrains(query: string): Promise<Train[]> {
    const q = query.trim().toLowerCase();
    if (!q) return this.fallback.searchTrains('');

    try {
      // 1. If it's a number, try fetching that exact train
      if (/^\d{4,5}$/.test(q)) {
        const data = await this.get<any>(`/trains/${q}`);
        if (data?.train) {
          return [this.mapTrain(data.train, q)];
        }
      }

      // 2. Search across the full lookup map
      const lookup = await this.getLookup();
      const results: Train[] = [];
      for (const [num, name] of Object.entries(lookup)) {
        if (num.includes(q) || name.toLowerCase().includes(q)) {
          results.push({
            id: num,
            number: num,
            name,
            origin: 'Origin Station',
            originCode: 'ORIG',
            destination: 'Destination Station',
            destinationCode: 'DEST',
            totalDistanceKm: 750,
            expectedDurationMinutes: 600,
            trainType: this.trainType(name),
          });
          if (results.length >= 15) break;
        }
      }

      // If we got results but no coordinates, enrich first 3 with actual data
      if (results.length > 0) {
        const enriched = await Promise.allSettled(
          results.slice(0, 3).map(async (tr) => {
            const d = await this.get<any>(`/trains/${tr.number}`);
            return d?.train ? this.mapTrain(d.train, tr.number) : tr;
          })
        );
        enriched.forEach((r, i) => {
          if (r.status === 'fulfilled') results[i] = r.value;
        });
      }

      if (results.length > 0) return results;
    } catch (e: any) {
      console.warn('[RailRadar] searchTrains failed:', e.message);
    }

    return this.fallback.searchTrains(query);
  }

  // ── TRAINS BETWEEN STATIONS ───────────────────────────────────────────────
  async getTrainsBetweenStations(from: string, to: string): Promise<Train[]> {
    try {
      const data = await this.get<any>(`/trains/between/${from.toUpperCase()}/${to.toUpperCase()}`);
      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          id: String(item.trainNumber || item.number),
          number: String(item.trainNumber || item.number),
          name: item.trainName || item.name || 'Express',
          origin: item.fromStationName || from,
          originCode: item.fromStationCode || from,
          destination: item.toStationName || to,
          destinationCode: item.toStationCode || to,
          totalDistanceKm: item.distance || 600,
          expectedDurationMinutes: item.duration || 480,
          trainType: this.trainType(item.trainName || item.name || ''),
        }));
      }
    } catch (e: any) {
      console.warn('[RailRadar] getTrainsBetweenStations failed:', e.message);
    }
    return this.fallback.getTrainsBetweenStations(from, to);
  }

  async getTrainById(id: string): Promise<Train | null> {
    const data = await this.get<any>(`/trains/${id}`);
    if (data?.train) return this.mapTrain(data.train, id);
    return this.fallback.getTrainById(id);
  }

  // ── LIVE JOURNEY STATUS ───────────────────────────────────────────────────
  async getLiveJourney(trainId: string): Promise<LiveJourneyStatus | null> {
    const data = await this.get<any>(`/trains/${trainId}/live?authoritative=true`);

    if (!data) {
      // Fallback to static train timetable if live status endpoint is not active
      const trainData = await this.get<any>(`/trains/${trainId}`);
      if (trainData?.train) {
        const train = this.mapTrain(trainData.train, trainId);
        const stops: any[] = Array.isArray(trainData.route) ? trainData.route : Object.values(trainData.route || {});
        const haltStops = stops.filter((s) => s.isHalt);
        const originHalt = haltStops[0] || stops[0] || {};
        const nextHalt = haltStops[1] || stops[1] || originHalt;

        const originLat = originHalt.station?.lat || trainData.train.source?.lat || 28.6139;
        const originLng = originHalt.station?.lng || trainData.train.source?.lng || 77.209;
        const nextLat = nextHalt.station?.lat || trainData.train.destination?.lat || originLat;
        const nextLng = nextHalt.station?.lng || trainData.train.destination?.lng || originLng;

        const curStation: Station = {
          id: `S-${originHalt.station?.code || train.originCode}`,
          code: originHalt.station?.code || train.originCode,
          name: originHalt.station?.name || train.origin,
          latitude: originLat,
          longitude: originLng,
        };

        const nxtStation: Station = {
          id: `S-${nextHalt.station?.code || train.destinationCode}`,
          code: nextHalt.station?.code || train.destinationCode,
          name: nextHalt.station?.name || train.destination,
          latitude: nextLat,
          longitude: nextLng,
        };

        const currentStationEvent: StationEvent = {
          journeyId: `J-${trainId}`,
          stationId: curStation.id,
          station: curStation,
          distanceFromOriginKm: 0,
          scheduledArrival: null,
          actualArrival: null,
          scheduledDeparture: this.formatTime(originHalt.departure),
          actualDeparture: null,
          delayMinutes: 0,
          status: 'upcoming',
          platform: originHalt.platform || '1',
        };

        const nextStationEvent: StationEvent = {
          journeyId: `J-${trainId}`,
          stationId: nxtStation.id,
          station: nxtStation,
          distanceFromOriginKm: nextHalt.distance || 50,
          scheduledArrival: this.formatTime(nextHalt.arrival),
          actualArrival: null,
          scheduledDeparture: this.formatTime(nextHalt.departure),
          actualDeparture: null,
          delayMinutes: 0,
          status: 'upcoming',
          platform: nextHalt.platform || '1',
        };

        return {
          id: `LJ-${trainId}-sched`,
          trainId,
          train,
          serviceDate: new Date().toISOString().split('T')[0],
          position: {
            latitude: originLat,
            longitude: originLng,
            speedKmph: 0,
            headingDegrees: 0,
          },
          currentStation: currentStationEvent,
          nextStation: nextStationEvent,
          delayMinutes: 0,
          distanceCoveredKm: 0,
          distanceRemainingKm: train.totalDistanceKm,
          completionPercentage: 0,
          lastUpdated: new Date().toISOString(),
          statusText: `Scheduled service from ${train.origin} to ${train.destination}.`,
          hasLiveData: false,
          isStale: true,
        };
      }
      return this.fallback.getLiveJourney(trainId);
    }

    try {
      const train = this.mapTrain(data.train || {}, trainId);
      const curLoc = data.currentLocation || {};
      const prevHalt = data.previousHalt || {};
      const delayMinutes: number = data.delayMinutes ?? curLoc.delayMinutes ?? 0;
      const isLive: boolean = !!data.isLive;

      // Build route stops from route object (keyed 0..N)
      const rawStops: RRStop[] = Array.isArray(data.route) ? data.route : Object.values(data.route || {});
      const halts = rawStops.filter((s) => s.isHalt);

      // Find current and next halt
      const curHalt = halts.find((s) => s.status === 'at-station') ||
        halts.filter((s) => s.status === 'departed').pop() ||
        halts[0] || rawStops[0];
      const nextHalt = halts.find((s) => s.status === 'not-departed') || halts[1] || curHalt;

      const totalDistance = train.totalDistanceKm;
      const coveredKm = curLoc.distanceFromOriginKm || curHalt?.distance || 0;
      const remainingKm = Math.max(0, totalDistance - coveredKm);
      const completionPct = totalDistance > 0 ? Math.round((coveredKm / totalDistance) * 100) : 0;
      const speed = curHalt?.speedToNextStationKmph || 85;

      // Coordinates
      const lat = curLoc.coordinates?.lat || curHalt?.lat || 19.076;
      const lng = curLoc.coordinates?.lng || curHalt?.lng || 72.877;

      // Current station event
      const curStation: Station = {
        id: `S-${curHalt?.stationCode || curLoc.stationCode || 'CUR'}`,
        code: curHalt?.stationCode || curLoc.stationCode || 'CUR',
        name: curHalt?.stationName || curLoc.stationName || 'Current Station',
        latitude: lat,
        longitude: lng,
      };

      const currentStationEvent: StationEvent = {
        journeyId: `J-${trainId}`,
        stationId: curStation.id,
        station: curStation,
        distanceFromOriginKm: coveredKm,
        scheduledArrival: this.formatTime(curHalt?.scheduledArrival),
        actualArrival: this.formatTime(curHalt?.actualArrival),
        scheduledDeparture: this.formatTime(curHalt?.scheduledDeparture),
        actualDeparture: this.formatTime(curHalt?.actualDeparture),
        delayMinutes,
        status: 'current',
        platform: curHalt?.platform || '1',
      };

      // Next station event
      const nextStation: Station = {
        id: `S-${nextHalt?.stationCode || 'NXT'}`,
        code: nextHalt?.stationCode || 'NXT',
        name: nextHalt?.stationName || 'Next Station',
        latitude: nextHalt?.lat || lat + 0.3,
        longitude: nextHalt?.lng || lng + 0.3,
      };

      const nextStationEvent: StationEvent = {
        journeyId: `J-${trainId}`,
        stationId: nextStation.id,
        station: nextStation,
        distanceFromOriginKm: nextHalt?.distance || coveredKm + 45,
        scheduledArrival: this.formatTime(nextHalt?.scheduledArrival),
        actualArrival: this.formatTime(nextHalt?.actualArrival),
        scheduledDeparture: this.formatTime(nextHalt?.scheduledDeparture),
        actualDeparture: null,
        delayMinutes,
        status: 'upcoming',
        platform: nextHalt?.platform || '1',
      };

      const statusParts: string[] = [];
      if (data.status === 'completed') {
        statusParts.push(`Train has arrived at its destination — ${train.destination}.`);
      } else {
        statusParts.push(
          delayMinutes === 0
            ? `Running right on time.`
            : `Running ${delayMinutes} min${delayMinutes > 1 ? 's' : ''} late.`
        );
        if (curHalt?.stationName) statusParts.push(`Departed ${curHalt.stationName}.`);
        if (nextHalt?.stationName) statusParts.push(`Approaching ${nextHalt.stationName}.`);
        if (speed > 0) statusParts.push(`Speed: ${Math.round(speed)} km/h.`);
      }

      return {
        id: `LJ-${trainId}-${Date.now()}`,
        trainId,
        train,
        serviceDate: data.startDate || new Date().toISOString().split('T')[0],
        position: {
          latitude: lat,
          longitude: lng,
          speedKmph: Math.round(speed),
          headingDegrees: 45,
        },
        currentStation: currentStationEvent,
        nextStation: nextStationEvent,
        delayMinutes,
        distanceCoveredKm: coveredKm,
        distanceRemainingKm: remainingKm,
        completionPercentage: Math.min(100, completionPct),
        lastUpdated: data.lastUpdatedAt || new Date().toISOString(),
        statusText: statusParts.join(' '),
        hasLiveData: isLive,
        isStale: !isLive,
      };
    } catch (e: any) {
      console.error('[RailRadar] getLiveJourney parse error:', e.message);
    }

    return this.fallback.getLiveJourney(trainId);
  }

  // ── ROUTE GEOMETRY ────────────────────────────────────────────────────────
  async getRouteGeometry(trainId: string): Promise<RouteGeometry | null> {
    // Fetch route geometry, live run, and static timetable simultaneously for complete details
    const [routeData, liveData, trainData] = await Promise.all([
      this.get<any>(`/trains/${trainId}/route?format=geojson&stops=true`),
      this.get<any>(`/trains/${trainId}/live`),
      this.get<any>(`/trains/${trainId}`),
    ]);

    if (!routeData && !trainData) return this.fallback.getRouteGeometry(trainId);

    try {
      // 1. Coordinates from GeoJSON polyline
      const coordinates: [number, number][] = routeData?.geojson?.geometry?.coordinates || [];

      // 2. Stops from routeData
      const rawStops: RRRouteStop[] = Array.isArray(routeData?.stops)
        ? routeData.stops
        : Object.values(routeData?.stops || {});

      // 3. Halt status and timing from live route or static timetable
      const liveRoute: RRStop[] = liveData
        ? (Array.isArray(liveData.route) ? liveData.route : Object.values(liveData.route || {}))
        : [];
      const timetableRoute: any[] = trainData
        ? (Array.isArray(trainData.route) ? trainData.route : Object.values(trainData.route || {}))
        : [];

      const haltStatusMap: Record<string, any> = {};
      if (liveRoute.length > 0) {
        liveRoute.forEach((s) => {
          haltStatusMap[s.stationCode] = s;
        });
      } else {
        timetableRoute.forEach((s) => {
          const code = s.station?.code || s.stationCode || s.code;
          if (code) {
            haltStatusMap[code] = {
              stationCode: code,
              stationName: s.station?.name || s.name,
              isHalt: s.isHalt !== false,
              status: 'upcoming',
              distance: s.distance || 0,
              scheduledArrival: s.arrival,
              scheduledDeparture: s.departure,
              platform: s.platform || '1',
              delayArrival: 0,
              delayDeparture: 0,
            };
          }
        });
      }

      // Filter to halting stations if known, otherwise keep all route stops
      let haltStops: RRRouteStop[] = rawStops;
      if (rawStops.length > 0) {
        const filtered = rawStops.filter((s) => {
          const info = haltStatusMap[s.code];
          return info ? info.isHalt : true;
        });
        if (filtered.length >= 2) {
          haltStops = filtered;
        }
      } else if (timetableRoute.length > 0) {
        // Synthesize route stops from timetable if routeData had no stops
        haltStops = timetableRoute
          .filter((s) => s.isHalt !== false)
          .map((s, idx) => ({
            sequence: s.sequence || idx + 1,
            code: s.station?.code || s.stationCode || `ST${idx}`,
            name: s.station?.name || s.name || 'Station',
            lat: s.station?.lat || 0,
            lng: s.station?.lng || 0,
          }));
      }

      // If coordinates array was empty, build from station lat/lng
      if (coordinates.length === 0 && haltStops.length > 0) {
        haltStops.forEach((st) => {
          if (st.lng && st.lat) {
            coordinates.push([st.lng, st.lat]);
          }
        });
      }

      const stations: StationEvent[] = haltStops.map((s) => {
        const liveStop = haltStatusMap[s.code];
        const rrStatus = liveStop?.status || (s.sequence === 1 ? 'departed' : 'not-departed');
        const status: StationEvent['status'] =
          rrStatus === 'at-station' ? 'current' : rrStatus === 'departed' ? 'passed' : 'upcoming';

        return {
          journeyId: `J-${trainId}`,
          stationId: `S-${s.code}`,
          station: {
            id: `S-${s.code}`,
            code: s.code,
            name: s.name,
            latitude: s.lat,
            longitude: s.lng,
          } as Station,
          distanceFromOriginKm: liveStop?.distance || 0,
          scheduledArrival: this.formatTime(liveStop?.scheduledArrival || liveStop?.arrival),
          actualArrival: this.formatTime(liveStop?.actualArrival),
          scheduledDeparture: this.formatTime(liveStop?.scheduledDeparture || liveStop?.departure),
          actualDeparture: this.formatTime(liveStop?.actualDeparture),
          delayMinutes: liveStop?.delayDeparture || liveStop?.delayArrival || 0,
          status,
          platform: liveStop?.platform || '1',
        };
      });

      if (coordinates.length === 0 && stations.length === 0) {
        return this.fallback.getRouteGeometry(trainId);
      }

      return { trainId, coordinates, stations };
    } catch (e: any) {
      console.error('[RailRadar] getRouteGeometry parse error:', e.message);
    }

    return this.fallback.getRouteGeometry(trainId);
  }

  // ── JOURNEY ANALYTICS ─────────────────────────────────────────────────────
  async getJourneyAnalytics(trainId: string): Promise<JourneyAnalytics | null> {
    const [live, route] = await Promise.all([
      this.getLiveJourney(trainId),
      this.getRouteGeometry(trainId),
    ]);

    if (!live || !route) return this.fallback.getJourneyAnalytics(trainId);

    // Build elevation profile using station lat/lng from route stops
    // We approximate Indian terrain elevations per geographic region
    const elevationProfile = route.stations.map((st, i) => {
      const lat = st.station.latitude;
      const lng = st.station.longitude;
      // Rough terrain elevation estimate: higher in central/western Ghats, lower in coastal/Gangetic plains
      const baseElev = Math.round(
        50 +
          Math.abs(Math.sin(lat * 0.25) * 400) +
          Math.abs(Math.cos(lng * 0.12) * 200) +
          Math.sin(i * 0.6) * 80
      );
      return {
        distanceKm: st.distanceFromOriginKm,
        elevationMeters: Math.max(10, baseElev),
        stationName: st.station.name,
      };
    });

    const maxElevation = Math.max(...elevationProfile.map((e) => e.elevationMeters));
    const highestPoint = elevationProfile.find((e) => e.elevationMeters === maxElevation);
    const passedCount = route.stations.filter((s) => s.status === 'passed' || s.status === 'current').length;

    return {
      journeyId: `J-${trainId}`,
      completionPercentage: live.completionPercentage,
      delayMinutes: live.delayMinutes,
      delayTrend: live.delayMinutes > 20 ? 'worsening' : live.delayMinutes === 0 ? 'improving' : 'stable',
      averageSpeedKmph: live.train.totalDistanceKm > 0
        ? Math.round(live.train.totalDistanceKm / (live.train.expectedDurationMinutes / 60))
        : 80,
      topSpeedKmph: live.position.speedKmph > 0 ? Math.round(live.position.speedKmph * 1.2) : 110,
      distanceCoveredKm: live.distanceCoveredKm,
      distanceRemainingKm: live.distanceRemainingKm,
      totalDistanceKm: live.train.totalDistanceKm,
      elevationProfile,
      highestElevationMeters: maxElevation,
      highestElevationPoint: highestPoint
        ? { locationName: highestPoint.stationName || 'Highest Point', elevationMeters: maxElevation }
        : undefined,
      totalDurationMinutes: live.train.expectedDurationMinutes,
      passedStationsCount: passedCount,
      totalStationsCount: route.stations.length,
      stationArrivalHistory: route.stations.map((s) => ({
        stationCode: s.station.code,
        stationName: s.station.name,
        scheduledTime: s.scheduledArrival || s.scheduledDeparture || '—',
        actualTime: s.actualArrival || s.actualDeparture || '—',
        delayMinutes: s.delayMinutes,
        isEstimated: s.status === 'upcoming',
      })),
    };
  }

  // ── WEATHER ──────────────────────────────────────────────────────────────
  async getWeather(lat: number, lng: number): Promise<WeatherInfo> {
    return this.weather.getWeather(lat, lng);
  }

  // ── JOURNEY WEATHER COMPANION ────────────────────────────────────────────
  async getJourneyWeather(trainId: string): Promise<JourneyWeatherCompanion | null> {
    const [live, route] = await Promise.all([
      this.getLiveJourney(trainId),
      this.getRouteGeometry(trainId),
    ]);

    if (!live || !route || route.stations.length === 0) {
      return this.fallback.getJourneyWeather(trainId);
    }

    const curStation = live.currentStation.station;
    const nextStation = live.nextStation.station;
    const destStation = route.stations[route.stations.length - 1].station;

    const [curW, nextW, destW] = await Promise.all([
      this.getWeather(curStation.latitude, curStation.longitude),
      this.getWeather(nextStation.latitude, nextStation.longitude),
      this.getWeather(destStation.latitude, destStation.longitude),
    ]);

    return {
      trainId,
      currentStationWeather: {
        stationType: 'current',
        stationCode: curStation.code,
        stationName: curStation.name,
        weather: { ...curW, locationName: curStation.name },
      },
      nextStationWeather: {
        stationType: 'next',
        stationCode: nextStation.code,
        stationName: nextStation.name,
        weather: { ...nextW, locationName: nextStation.name },
      },
      destinationStationWeather: {
        stationType: 'destination',
        stationCode: destStation.code,
        stationName: destStation.name,
        weather: { ...destW, locationName: destStation.name },
      },
    };
  }

  // ── ROUTE CONTEXT ────────────────────────────────────────────────────────
  async getRouteContext(lat: number, lng: number): Promise<TravelCompanionContext> {
    const wx = await this.getWeather(lat, lng);
    const ctx = await this.fallback.getRouteContext(lat, lng);
    return { ...ctx, weather: wx };
  }
}
