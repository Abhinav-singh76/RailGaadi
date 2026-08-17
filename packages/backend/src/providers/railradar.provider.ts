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
  private TIMEOUT_MS = 15000; // 15s timeout per request

  // Response cache: path → { data, ts }
  private cache = new Map<string, { data: any; ts: number }>();
  private LIVE_TTL = 30_000;        // 30s for live data
  private STATIC_TTL = 3_600_000;  // 1hr for timetables/routes

  // Lookup cache for 13k train map
  private lookupCache: Record<string, string> | null = null;
  private lookupFetchedAt = 0;

  constructor() {
    this.apiKey = process.env.RAILRADAR_API_KEY || 'rg_28e6a44d86e44304bf8a0fd8b23527c0';
    this.fallback = new MockRailProvider();
    this.weather = new OpenWeatherProvider();
  }

  // ── Fetch with timeout and caching ─────────────────────────────────────────
  private async get<T = any>(path: string): Promise<T | null> {
    const ttl = path.includes('/live') ? this.LIVE_TTL : this.STATIC_TTL;
    const cached = this.cache.get(path);
    if (cached && Date.now() - cached.ts < ttl) {
      return cached.data as T;
    }

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

      const res = await fetch(`${this.base}${path}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!res.ok) {
        console.warn(`[RailRadar] ${path} → HTTP ${res.status}`);
        return cached ? (cached.data as T) : null;
      }

      const body = await res.json();
      if (!body.success) {
        console.warn(`[RailRadar] ${path} → API error: ${body.error?.message}`);
        return cached ? (cached.data as T) : null;
      }

      this.cache.set(path, { data: body.data, ts: Date.now() });
      return body.data as T;
    } catch (e: any) {
      if (e.name === 'AbortError') {
        console.warn(`[RailRadar] ${path} → TIMEOUT after ${this.TIMEOUT_MS}ms`);
      } else {
        console.warn(`[RailRadar] ${path} → ${e.message}`);
      }
      return cached ? (cached.data as T) : null;
    }
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────
  private fmtTime(val?: string | null): string | null {
    if (!val) return null;
    // Already HH:mm or HH:mm:ss
    if (/^\d{1,2}:\d{2}/.test(val)) return val.slice(0, 5);
    // ISO timestamp
    try {
      return new Date(val).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch {
      return null;
    }
  }

  private trainType(name: string, type = ''): Train['trainType'] {
    const s = `${name} ${type}`.toLowerCase();
    if (s.includes('vande bharat')) return 'Vande Bharat';
    if (s.includes('rajdhani')) return 'Rajdhani';
    if (s.includes('shatabdi') || s.includes('tejas')) return 'Shatabdi';
    if (s.includes('superfast') || s.includes(' sf ') || s.includes('duronto')) return 'Superfast';
    return 'Express';
  }

  private mapTrain(t: any, num: string): Train {
    return {
      id: String(t?.number || num),
      number: String(t?.number || num),
      name: t?.name || `Express #${num}`,
      origin: t?.source?.name || 'Origin Station',
      originCode: t?.source?.code || 'SRC',
      destination: t?.destination?.name || 'Destination Station',
      destinationCode: t?.destination?.code || 'DST',
      totalDistanceKm: t?.distance || 800,
      expectedDurationMinutes: t?.duration || 600,
      trainType: this.trainType(t?.name || '', t?.type || ''),
    };
  }

  // ── Lookup all 13k trains ────────────────────────────────────────────────────
  private async getLookup(): Promise<Record<string, string>> {
    const now = Date.now();
    if (this.lookupCache && now - this.lookupFetchedAt < this.STATIC_TTL) {
      return this.lookupCache;
    }
    const data = await this.get<Record<string, string>>('/lookup/trains');
    if (data) {
      this.lookupCache = data;
      this.lookupFetchedAt = now;
    }
    return this.lookupCache || {};
  }

  // ── Search ────────────────────────────────────────────────────────────────────
  async searchTrains(query: string): Promise<Train[]> {
    const q = query.trim().toLowerCase();
    if (!q) return this.fallback.searchTrains('');

    try {
      // Exact 5-digit train number → fetch that train directly
      if (/^\d{4,5}$/.test(q)) {
        const data = await this.get<any>(`/trains/${q}`);
        if (data?.train) return [this.mapTrain(data.train, q)];
      }

      // Fuzzy search over full lookup map
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

      // Enrich first result with actual route data
      if (results.length > 0) {
        const data = await this.get<any>(`/trains/${results[0].number}`);
        if (data?.train) results[0] = this.mapTrain(data.train, results[0].number);
      }

      if (results.length > 0) return results;
    } catch (e: any) {
      console.warn('[RailRadar] searchTrains error:', e.message);
    }

    return this.fallback.searchTrains(query);
  }

  // ── Trains between stations ────────────────────────────────────────────────
  async getTrainsBetweenStations(from: string, to: string): Promise<Train[]> {
    try {
      const data = await this.get<any>(
        `/trains/between/${from.toUpperCase()}/${to.toUpperCase()}`
      );
      // RailRadar returns { from, to, trains: [...], count }
      const trains = data?.trains || (Array.isArray(data) ? data : []);
      if (trains.length > 0) {
        return trains.map((item: any) => {
          const t = item.train || item;
          return {
            id: String(t.number || t.trainNumber || ''),
            number: String(t.number || t.trainNumber || ''),
            name: t.name || t.trainName || 'Express',
            origin: item.from?.name || from,
            originCode: item.from?.code || from,
            destination: item.to?.name || to,
            destinationCode: item.to?.code || to,
            totalDistanceKm: item.distance || 600,
            expectedDurationMinutes: item.duration || 480,
            trainType: this.trainType(t.name || t.trainName || '', t.type || ''),
          };
        });
      }
    } catch (e: any) {
      console.warn('[RailRadar] getTrainsBetweenStations error:', e.message);
    }
    return this.fallback.getTrainsBetweenStations(from, to);
  }

  async getTrainById(id: string): Promise<Train | null> {
    const data = await this.get<any>(`/trains/${id}`);
    if (data?.train) return this.mapTrain(data.train, id);
    return this.fallback.getTrainById(id);
  }

  // ── Live Journey ───────────────────────────────────────────────────────────
  async getLiveJourney(trainId: string): Promise<LiveJourneyStatus | null> {
    const data = await this.get<any>(`/trains/${trainId}/live?authoritative=true`);
    if (!data) return this.fallback.getLiveJourney(trainId);

    try {
      const train = this.mapTrain(data.train, trainId);
      const curLoc = data.currentLocation || {};
      const delay: number = Number(data.delayMinutes ?? curLoc.delayMinutes ?? 0);
      const isLive: boolean = !!data.isLive;

      // Use API-provided nextHalt and previousHalt directly (much more reliable)
      const nextHalt = data.nextHalt;
      const prevHalt = data.previousHalt || curLoc;

      // Current position coordinates
      const lat: number = curLoc.coordinates?.lat || 19.076;
      const lng: number = curLoc.coordinates?.lng || 72.877;

      const totalDistance = train.totalDistanceKm;
      const coveredKm = curLoc.distanceFromOriginKm || prevHalt?.distance || 0;
      const remainingKm = Math.max(0, totalDistance - coveredKm);
      const completionPct = totalDistance > 0 ? Math.round((coveredKm / totalDistance) * 100) : 0;

      // Route stops for extra data
      const allStops: RRStop[] = Object.values(data.route || {});
      const haltStops = allStops.filter((s) => s.isHalt);

      // Find the full stop object for current and next halt
      const curHaltStop = haltStops.find((s) => s.stationCode === (prevHalt?.stationCode || curLoc.stationCode));
      const nextHaltStop = haltStops.find((s) => s.stationCode === nextHalt?.stationCode);
      const speed = curHaltStop?.speedToNextStationKmph || nextHaltStop?.speedToNextStationKmph || 85;

      // Build current station
      const curStation: Station = {
        id: `S-${prevHalt?.stationCode || 'CUR'}`,
        code: prevHalt?.stationCode || curLoc.stationCode || 'CUR',
        name: prevHalt?.stationName || curLoc.stationName || 'Current Station',
        latitude: lat,
        longitude: lng,
      };

      const currentStationEvent: StationEvent = {
        journeyId: `J-${trainId}`,
        stationId: curStation.id,
        station: curStation,
        distanceFromOriginKm: prevHalt?.distance || coveredKm,
        scheduledArrival: this.fmtTime(curHaltStop?.scheduledArrival),
        actualArrival: this.fmtTime(curHaltStop?.actualArrival),
        scheduledDeparture: this.fmtTime(curHaltStop?.scheduledDeparture),
        actualDeparture: this.fmtTime(curHaltStop?.actualDeparture),
        delayMinutes: delay,
        status: 'current',
        platform: curHaltStop?.platform || '1',
      };

      // Build next station
      const nextStation: Station = {
        id: `S-${nextHalt?.stationCode || 'NXT'}`,
        code: nextHalt?.stationCode || 'NXT',
        name: nextHalt?.stationName || 'Next Halt',
        latitude: lat + 0.3,
        longitude: lng + 0.3,
      };

      const nextStationEvent: StationEvent = {
        journeyId: `J-${trainId}`,
        stationId: nextStation.id,
        station: nextStation,
        distanceFromOriginKm: nextHalt?.distance || coveredKm + 50,
        scheduledArrival: this.fmtTime(nextHaltStop?.scheduledArrival),
        actualArrival: this.fmtTime(nextHaltStop?.actualArrival),
        scheduledDeparture: this.fmtTime(nextHaltStop?.scheduledDeparture),
        actualDeparture: null,
        delayMinutes: delay,
        status: 'upcoming',
        platform: nextHaltStop?.platform || '1',
      };

      // Build status text
      let statusText = '';
      if (data.status === 'completed') {
        statusText = `Arrived at destination — ${train.destination}.`;
      } else {
        statusText = delay === 0 ? 'Running on time.' : `Running ${delay} min${delay !== 1 ? 's' : ''} late.`;
        if (curStation.name !== 'Current Station') statusText += ` Last halt: ${curStation.name}.`;
        if (nextStation.name !== 'Next Halt') statusText += ` Approaching ${nextStation.name}.`;
        if (speed > 0) statusText += ` Speed: ${Math.round(speed)} km/h.`;
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
        delayMinutes: delay,
        distanceCoveredKm: coveredKm,
        distanceRemainingKm: remainingKm,
        completionPercentage: Math.min(100, completionPct),
        lastUpdated: data.lastUpdatedAt || new Date().toISOString(),
        statusText,
        hasLiveData: isLive,
        isStale: !isLive,
      };
    } catch (e: any) {
      console.error('[RailRadar] getLiveJourney parse error:', e.message);
    }

    return this.fallback.getLiveJourney(trainId);
  }

  // ── Route Geometry ─────────────────────────────────────────────────────────
  async getRouteGeometry(trainId: string): Promise<RouteGeometry | null> {
    // Fetch route and live data concurrently (both have independent caching)
    const [routeData, liveData] = await Promise.all([
      this.get<any>(`/trains/${trainId}/route?format=geojson&stops=true`),
      this.get<any>(`/trains/${trainId}/live?authoritative=true`),
    ]);

    if (!routeData) return this.fallback.getRouteGeometry(trainId);

    try {
      // 431-point GeoJSON polyline from RailRadar
      const coordinates: [number, number][] = routeData.geojson?.geometry?.coordinates || [];

      // All stops from the route endpoint (true array, 111 stops)
      const allRouteStops: RRRouteStop[] = Array.isArray(routeData.stops)
        ? routeData.stops
        : Object.values(routeData.stops || {});

      // Live route for status enrichment
      const liveStops: RRStop[] = liveData ? Object.values(liveData.route || {}) : [];
      const liveHaltMap: Record<string, RRStop> = {};
      liveStops.forEach((s) => {
        if (s.isHalt) liveHaltMap[s.stationCode] = s;
      });

      // Only show halting stations in the timeline  
      const haltRouteStops = allRouteStops.filter((s) => {
        // A stop is a halt if the live data marks it as isHalt, or if it's the origin/dest
        const ls = liveHaltMap[s.code];
        if (ls) return true;
        // For trains where live data isn't available, show all stops every ~50km apart
        return false;
      });

      // Fallback: if no halts identified (no live data), show all route stops
      const stopsToRender = haltRouteStops.length > 0 ? haltRouteStops : allRouteStops;

      const stations: StationEvent[] = stopsToRender.map((s) => {
        const ls = liveHaltMap[s.code];
        const rrStatus = ls?.status;
        const status: StationEvent['status'] =
          rrStatus === 'at-station' ? 'current'
            : rrStatus === 'departed' ? 'passed'
              : 'upcoming';

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
          distanceFromOriginKm: ls?.distance || 0,
          scheduledArrival: this.fmtTime(ls?.scheduledArrival),
          actualArrival: this.fmtTime(ls?.actualArrival),
          scheduledDeparture: this.fmtTime(ls?.scheduledDeparture),
          actualDeparture: this.fmtTime(ls?.actualDeparture),
          delayMinutes: ls?.delayDeparture || ls?.delayArrival || 0,
          status,
          platform: ls?.platform || '—',
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

  // ── Journey Analytics ──────────────────────────────────────────────────────
  async getJourneyAnalytics(trainId: string): Promise<JourneyAnalytics | null> {
    const [live, route] = await Promise.all([
      this.getLiveJourney(trainId),
      this.getRouteGeometry(trainId),
    ]);

    if (!live || !route) return this.fallback.getJourneyAnalytics(trainId);

    const elevationProfile = route.stations.map((st, i) => {
      const lat = st.station.latitude;
      const lng = st.station.longitude;
      // Approximate terrain elevation from lat/lng (Indian terrain)
      const elev = Math.max(10, Math.round(
        50 + Math.abs(Math.sin(lat * 0.25) * 400) + Math.abs(Math.cos(lng * 0.12) * 200) + Math.sin(i * 0.6) * 80
      ));
      return {
        distanceKm: st.distanceFromOriginKm,
        elevationMeters: elev,
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
      topSpeedKmph: Math.max(live.position.speedKmph, 110),
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

  // ── Weather ────────────────────────────────────────────────────────────────
  async getWeather(lat: number, lng: number): Promise<WeatherInfo> {
    return this.weather.getWeather(lat, lng);
  }

  // ── Journey Weather Companion ──────────────────────────────────────────────
  async getJourneyWeather(trainId: string): Promise<JourneyWeatherCompanion | null> {
    const [live, route] = await Promise.all([
      this.getLiveJourney(trainId),
      this.getRouteGeometry(trainId),
    ]);

    if (!live || !route || route.stations.length === 0) {
      return this.fallback.getJourneyWeather(trainId);
    }

    const cur = live.currentStation.station;
    const nxt = live.nextStation.station;
    const dest = route.stations[route.stations.length - 1].station;

    const [curW, nxtW, destW] = await Promise.all([
      this.getWeather(cur.latitude, cur.longitude),
      this.getWeather(nxt.latitude, nxt.longitude),
      this.getWeather(dest.latitude, dest.longitude),
    ]);

    return {
      trainId,
      currentStationWeather: {
        stationType: 'current',
        stationCode: cur.code,
        stationName: cur.name,
        weather: { ...curW, locationName: cur.name },
      },
      nextStationWeather: {
        stationType: 'next',
        stationCode: nxt.code,
        stationName: nxt.name,
        weather: { ...nxtW, locationName: nxt.name },
      },
      destinationStationWeather: {
        stationType: 'destination',
        stationCode: dest.code,
        stationName: dest.name,
        weather: { ...destW, locationName: dest.name },
      },
    };
  }

  // ── Route Context ──────────────────────────────────────────────────────────
  async getRouteContext(lat: number, lng: number): Promise<TravelCompanionContext> {
    const wx = await this.getWeather(lat, lng);
    const ctx = await this.fallback.getRouteContext(lat, lng);
    return { ...ctx, weather: wx };
  }
}
