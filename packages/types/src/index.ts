export interface Train {
  id: string;
  number: string;
  name: string;
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  totalDistanceKm: number;
  expectedDurationMinutes: number;
  trainType: 'Vande Bharat' | 'Rajdhani' | 'Shatabdi' | 'Express' | 'Superfast';
}

export interface Station {
  id: string;
  code: string;
  name: string;
  latitude: number;
  longitude: number;
  elevationMeters?: number;
  state?: string;
  platformCount?: number;
}

export interface StationEvent {
  journeyId: string;
  stationId: string;
  station: Station;
  distanceFromOriginKm: number;
  scheduledArrival: string | null; // ISO Timestamp or HH:mm
  actualArrival: string | null;
  scheduledDeparture: string | null;
  actualDeparture: string | null;
  delayMinutes: number;
  status: 'passed' | 'current' | 'upcoming';
  platform?: string;
}

export interface JourneyPosition {
  latitude: number;
  longitude: number;
  speedKmph: number;
  headingDegrees: number;
}

export interface LiveJourneyStatus {
  id: string;
  trainId: string;
  train: Train;
  serviceDate: string; // YYYY-MM-DD
  position: JourneyPosition;
  currentStation: StationEvent;
  nextStation: StationEvent;
  delayMinutes: number;
  distanceCoveredKm: number;
  distanceRemainingKm: number;
  completionPercentage: number; // 0-100
  lastUpdated: string; // ISO Timestamp
  statusText: string;
  hasLiveData: boolean;
  isStale: boolean;
}

export interface RouteGeometry {
  trainId: string;
  coordinates: [number, number][]; // [lng, lat]
  stations: StationEvent[];
}

export interface JourneyAnalytics {
  journeyId: string;
  completionPercentage: number;
  delayMinutes: number;
  delayTrend: 'improving' | 'stable' | 'worsening';
  averageSpeedKmph: number;
  topSpeedKmph: number;
  distanceCoveredKm: number;
  distanceRemainingKm: number;
  totalDistanceKm: number;
  elevationProfile: {
    distanceKm: number;
    elevationMeters: number;
    stationName?: string;
  }[];
  highestElevationMeters: number;
  highestElevationPoint?: {
    locationName: string;
    elevationMeters: number;
  };
  totalDurationMinutes: number;
  passedStationsCount: number;
  totalStationsCount: number;
  stationArrivalHistory: {
    stationCode: string;
    stationName: string;
    scheduledTime: string;
    actualTime: string;
    delayMinutes: number;
    isEstimated: boolean;
  }[];
}

export interface WeatherInfo {
  locationName: string;
  temperatureC: number;
  feelsLikeC: number;
  humidityPercentage: number;
  windSpeedKmph: number;
  weatherCondition: string;
  icon: string;
  rainForecastPercent: number;
  uvIndex?: number;
}

export interface GeographicFeature {
  id: string;
  name: string;
  type: 'river' | 'lake' | 'mountain' | 'ghat' | 'bridge' | 'tunnel' | 'valley';
  description?: string;
  distanceFromRouteKm: number;
  coordinates: [number, number];
}

export interface NearbyPOI {
  id: string;
  name: string;
  category: 'monument' | 'tourist' | 'city' | 'district' | 'nature' | 'heritage';
  distanceFromStationKm: number;
  description?: string;
  rating?: number;
  imageUrl?: string;
}

export interface StationWeather {
  stationType: 'current' | 'next' | 'destination';
  stationCode: string;
  stationName: string;
  weather: WeatherInfo;
}

export interface JourneyWeatherCompanion {
  trainId: string;
  currentStationWeather: StationWeather;
  nextStationWeather: StationWeather;
  destinationStationWeather: StationWeather;
}

export interface TravelCompanionContext {
  stationCode: string;
  stationName: string;
  weather: WeatherInfo;
  geography: GeographicFeature[];
  places: NearbyPOI[];
}

export interface Favourite {
  deviceId: string;
  trainId: string;
  train: Train;
  addedAt: string;
}

export interface ShareLink {
  id: string;
  journeyId: string;
  trainId: string;
  createdAt: string;
  expiresAt: string;
  shareUrl: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    cached?: boolean;
    provider?: string;
  };
}
