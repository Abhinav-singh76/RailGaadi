import { IRailProvider } from '../providers/provider.interface.js';
import { MockRailProvider } from '../providers/mock.provider.js';
import { RailRadarProvider } from '../providers/railradar.provider.js';
import {
  Train,
  LiveJourneyStatus,
  RouteGeometry,
  JourneyAnalytics,
  WeatherInfo,
  JourneyWeatherCompanion,
  TravelCompanionContext,
} from '@railgaadi/types';

export class TrainService {
  private provider: IRailProvider;
  private railRadarProvider: RailRadarProvider;

  constructor(provider?: IRailProvider) {
    this.railRadarProvider = new RailRadarProvider();
    if (provider) {
      this.provider = provider;
    } else if (process.env.RAIL_PROVIDER === 'mock') {
      this.provider = new MockRailProvider();
    } else {
      this.provider = this.railRadarProvider;
    }
  }

  async searchTrains(query: string): Promise<Train[]> {
    if (!query || query.trim().length === 0) {
      // return default popular list
      return this.provider.searchTrains('');
    }
    return this.provider.searchTrains(query);
  }

  async getTrainsBetweenStations(fromCode: string, toCode: string): Promise<Train[]> {
    if (this.provider instanceof RailRadarProvider) {
      return this.provider.getTrainsBetweenStations(fromCode, toCode);
    }
    return this.railRadarProvider.getTrainsBetweenStations(fromCode, toCode);
  }

  async getTrainById(id: string): Promise<Train | null> {
    return this.provider.getTrainById(id);
  }

  async getLiveJourney(trainId: string): Promise<LiveJourneyStatus | null> {
    return this.provider.getLiveJourney(trainId);
  }

  async getRouteGeometry(trainId: string): Promise<RouteGeometry | null> {
    return this.provider.getRouteGeometry(trainId);
  }

  async getJourneyAnalytics(trainId: string): Promise<JourneyAnalytics | null> {
    return this.provider.getJourneyAnalytics(trainId);
  }

  async getWeather(lat: number, lng: number): Promise<WeatherInfo> {
    return this.provider.getWeather(lat, lng);
  }

  async getJourneyWeather(trainId: string): Promise<JourneyWeatherCompanion | null> {
    return this.provider.getJourneyWeather(trainId);
  }

  async getRouteContext(lat: number, lng: number): Promise<TravelCompanionContext> {
    return this.provider.getRouteContext(lat, lng);
  }
}
