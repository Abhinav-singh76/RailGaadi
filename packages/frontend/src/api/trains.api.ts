import { apiClient } from './client.js';
import {
  Train,
  LiveJourneyStatus,
  RouteGeometry,
  JourneyAnalytics,
  WeatherInfo,
  JourneyWeatherCompanion,
  TravelCompanionContext,
  ApiResponse,
} from '@railgaadi/types';

export async function searchTrains(query: string): Promise<Train[]> {
  const res = await apiClient.get<ApiResponse<Train[]>>(`/trains/search?q=${encodeURIComponent(query)}`);
  return res.data.data || [];
}

export async function getTrainsBetweenStations(from: string, to: string): Promise<Train[]> {
  if (!from || !to) return [];
  const res = await apiClient.get<ApiResponse<Train[]>>(`/trains/between?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
  return res.data.data || [];
}

export async function getLiveJourney(trainId: string): Promise<LiveJourneyStatus | null> {
  const res = await apiClient.get<ApiResponse<LiveJourneyStatus>>(`/trains/${trainId}/live`);
  return res.data.data || null;
}

export async function getRouteGeometry(trainId: string): Promise<RouteGeometry | null> {
  const res = await apiClient.get<ApiResponse<RouteGeometry>>(`/trains/${trainId}/route`);
  return res.data.data || null;
}

export async function getJourneyAnalytics(trainId: string): Promise<JourneyAnalytics | null> {
  const res = await apiClient.get<ApiResponse<JourneyAnalytics>>(`/trains/${trainId}/analytics`);
  return res.data.data || null;
}

export async function getWeather(lat: number, lng: number): Promise<WeatherInfo | null> {
  const res = await apiClient.get<ApiResponse<WeatherInfo>>(`/weather?lat=${lat}&lng=${lng}`);
  return res.data.data || null;
}

export async function getJourneyWeather(trainId: string): Promise<JourneyWeatherCompanion | null> {
  const res = await apiClient.get<ApiResponse<JourneyWeatherCompanion>>(`/weather/journey/${trainId}`);
  return res.data.data || null;
}

export async function getRouteContext(lat: number, lng: number): Promise<TravelCompanionContext | null> {
  const res = await apiClient.get<ApiResponse<TravelCompanionContext>>(`/route/context?lat=${lat}&lng=${lng}`);
  return res.data.data || null;
}
