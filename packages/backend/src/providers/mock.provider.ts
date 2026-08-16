import { IRailProvider } from './provider.interface.js';
import { MOCK_TRAINS, getOrCreateDynamicTrain, generateLiveStatus } from './mock.data.js';
import { OpenWeatherProvider } from './openweather.provider.js';
import {
  Train,
  LiveJourneyStatus,
  RouteGeometry,
  JourneyAnalytics,
  WeatherInfo,
  StationWeather,
  JourneyWeatherCompanion,
  TravelCompanionContext,
  StationEvent,
} from '@railgaadi/types';

export class MockRailProvider implements IRailProvider {
  name = 'MockRailRadarProvider';

  async searchTrains(query: string): Promise<Train[]> {
    const q = query.trim().toLowerCase();
    if (!q) return Object.values(MOCK_TRAINS).map((d) => d.train);

    const matches = Object.values(MOCK_TRAINS)
      .map((d) => d.train)
      .filter(
        (t) =>
          t.number.toLowerCase().includes(q) ||
          t.name.toLowerCase().includes(q) ||
          t.origin.toLowerCase().includes(q) ||
          t.destination.toLowerCase().includes(q) ||
          t.originCode.toLowerCase().includes(q) ||
          t.destinationCode.toLowerCase().includes(q)
      );

    if (matches.length === 0 && /^\d{4,5}$/.test(q)) {
      const dynamic = getOrCreateDynamicTrain(q);
      return [dynamic.train];
    }

    return matches;
  }

  async getTrainsBetweenStations(from: string, to: string): Promise<Train[]> {
    const f = from.toLowerCase();
    const t = to.toLowerCase();
    return Object.values(MOCK_TRAINS)
      .map((d) => d.train)
      .filter(
        (train) =>
          (train.originCode.toLowerCase() === f || train.origin.toLowerCase().includes(f)) &&
          (train.destinationCode.toLowerCase() === t || train.destination.toLowerCase().includes(t))
      );
  }


  async getTrainById(id: string): Promise<Train | null> {
    const detail = getOrCreateDynamicTrain(id);
    return detail ? detail.train : null;
  }

  async getLiveJourney(trainId: string): Promise<LiveJourneyStatus | null> {
    return generateLiveStatus(trainId);
  }

  async getRouteGeometry(trainId: string): Promise<RouteGeometry | null> {
    const detail = getOrCreateDynamicTrain(trainId);
    if (!detail) return null;

    const liveStatus = generateLiveStatus(trainId);

    const stationEvents: StationEvent[] = detail.schedule.map((sch) => {
      const station = detail.stations.find((s) => s.code === sch.stationCode) || detail.stations[0];
      let status: 'passed' | 'current' | 'upcoming' = 'upcoming';

      if (liveStatus) {
        if (sch.distanceKm < liveStatus.currentStation.distanceFromOriginKm) {
          status = 'passed';
        } else if (sch.stationCode === liveStatus.currentStation.station.code) {
          status = 'current';
        }
      }

      return {
        journeyId: `J-${trainId}`,
        stationId: station.id,
        station,
        distanceFromOriginKm: sch.distanceKm,
        scheduledArrival: sch.scheduledArrival,
        actualArrival: sch.scheduledArrival ? sch.scheduledArrival : null,
        scheduledDeparture: sch.scheduledDeparture,
        actualDeparture: sch.scheduledDeparture ? sch.scheduledDeparture : null,
        delayMinutes: liveStatus?.delayMinutes || 0,
        status,
        platform: sch.platform,
      };
    });

    return {
      trainId,
      coordinates: detail.routeCoordinates,
      stations: stationEvents,
    };
  }

  async getJourneyAnalytics(trainId: string): Promise<JourneyAnalytics | null> {
    const detail = getOrCreateDynamicTrain(trainId);
    if (!detail) return null;

    const live = generateLiveStatus(trainId);
    const completionPercentage = live ? live.completionPercentage : 50;

    const elevationProfile = detail.schedule.map((s) => ({
      distanceKm: s.distanceKm,
      elevationMeters: s.elevationMeters,
      stationName: detail.stations.find((st) => st.code === s.stationCode)?.name,
    }));

    const maxElevation = Math.max(...elevationProfile.map((e) => e.elevationMeters));
    const highestPoint = elevationProfile.find((e) => e.elevationMeters === maxElevation);

    return {
      journeyId: `J-${trainId}`,
      completionPercentage,
      delayMinutes: live ? live.delayMinutes : 8,
      delayTrend: 'stable',
      averageSpeedKmph: 98,
      topSpeedKmph: 130,
      distanceCoveredKm: live ? live.distanceCoveredKm : Math.round(detail.train.totalDistanceKm * 0.5),
      distanceRemainingKm: live ? live.distanceRemainingKm : Math.round(detail.train.totalDistanceKm * 0.5),
      totalDistanceKm: detail.train.totalDistanceKm,
      elevationProfile,
      highestElevationMeters: maxElevation,
      highestElevationPoint: highestPoint
        ? {
            locationName: highestPoint.stationName || 'Ghat Pass Point',
            elevationMeters: maxElevation,
          }
        : undefined,
      totalDurationMinutes: detail.train.expectedDurationMinutes,
      passedStationsCount: Math.max(1, Math.round(detail.stations.length * (completionPercentage / 100))),
      totalStationsCount: detail.stations.length,
      stationArrivalHistory: detail.schedule.map((s) => {
        const st = detail.stations.find((item) => item.code === s.stationCode) || detail.stations[0];
        return {
          stationCode: s.stationCode,
          stationName: st.name,
          scheduledTime: s.scheduledArrival || s.scheduledDeparture || '00:00',
          actualTime: s.scheduledArrival || s.scheduledDeparture || '00:00',
          delayMinutes: live?.delayMinutes || 0,
          isEstimated: s.distanceKm > (live?.distanceCoveredKm || 0),
        };
      }),
    };
  }

  private weather = new OpenWeatherProvider();

  async getWeather(lat: number, lng: number): Promise<WeatherInfo> {
    return this.weather.getWeather(lat, lng);
  }

  async getJourneyWeather(trainId: string): Promise<JourneyWeatherCompanion | null> {
    const live = await this.getLiveJourney(trainId);
    const detail = getOrCreateDynamicTrain(trainId);
    if (!live || !detail || detail.stations.length === 0) return null;

    const currentStation = live.currentStation.station;
    const nextStation = live.nextStation.station;
    const destinationStation = detail.stations[detail.stations.length - 1];

    const [currentWeather, nextWeather, destWeather] = await Promise.all([
      this.getWeather(currentStation.latitude, currentStation.longitude),
      this.getWeather(nextStation.latitude, nextStation.longitude),
      this.getWeather(destinationStation.latitude, destinationStation.longitude),
    ]);

    return {
      trainId,
      currentStationWeather: {
        stationType: 'current',
        stationCode: currentStation.code,
        stationName: currentStation.name,
        weather: {
          ...currentWeather,
          locationName: currentStation.name,
        },
      },
      nextStationWeather: {
        stationType: 'next',
        stationCode: nextStation.code,
        stationName: nextStation.name,
        weather: {
          ...nextWeather,
          locationName: nextStation.name,
        },
      },
      destinationStationWeather: {
        stationType: 'destination',
        stationCode: destinationStation.code,
        stationName: destinationStation.name,
        weather: {
          ...destWeather,
          locationName: destinationStation.name,
        },
      },
    };
  }

  async getRouteContext(lat: number, lng: number): Promise<TravelCompanionContext> {
    return {
      stationCode: 'CURRENT',
      stationName: 'Active Region',
      weather: await this.getWeather(lat, lng),
      geography: [
        {
          id: 'g1',
          name: 'Narmada River Rail Bridge',
          type: 'bridge',
          description: 'Historical rail bridge spanning across the sacred Narmada River.',
          distanceFromRouteKm: 0.2,
          coordinates: [lng, lat],
        },
        {
          id: 'g2',
          name: 'Western Ghats Scenic Pass',
          type: 'ghat',
          description: 'Scenic mountain tunnel corridor with panoramic valleys and waterfall views.',
          distanceFromRouteKm: 3.5,
          coordinates: [lng + 0.05, lat + 0.05],
        },
      ],
      places: [
        {
          id: 'p1',
          name: 'Laxmi Vilas Palace',
          category: 'monument',
          distanceFromStationKm: 3.2,
          description: 'Grand royal residence of the Gaekwad dynasty, 4x the size of Buckingham Palace.',
          rating: 4.8,
        },
        {
          id: 'p2',
          name: 'Sabarmati Ashram',
          category: 'heritage',
          distanceFromStationKm: 5.1,
          description: 'Historic national landmark and home of Mahatma Gandhi.',
          rating: 4.9,
        },
      ],
    };
  }
}
