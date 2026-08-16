import {
  Train,
  LiveJourneyStatus,
  RouteGeometry,
  JourneyAnalytics,
  WeatherInfo,
  JourneyWeatherCompanion,
  TravelCompanionContext,
} from '@railgaadi/types';

export interface IRailProvider {
  name: string;
  searchTrains(query: string): Promise<Train[]>;
  getTrainsBetweenStations(from: string, to: string): Promise<Train[]>;
  getTrainById(id: string): Promise<Train | null>;
  getLiveJourney(trainId: string): Promise<LiveJourneyStatus | null>;
  getRouteGeometry(trainId: string): Promise<RouteGeometry | null>;
  getJourneyAnalytics(trainId: string): Promise<JourneyAnalytics | null>;
  getWeather(lat: number, lng: number): Promise<WeatherInfo>;
  getJourneyWeather(trainId: string): Promise<JourneyWeatherCompanion | null>;
  getRouteContext(lat: number, lng: number, radiusKm?: number): Promise<TravelCompanionContext>;
}
