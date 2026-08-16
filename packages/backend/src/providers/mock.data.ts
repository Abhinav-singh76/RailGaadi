import {
  Train,
  Station,
  StationEvent,
  LiveJourneyStatus,
  RouteGeometry,
  JourneyAnalytics,
  WeatherInfo,
  TravelCompanionContext,
} from '@railgaadi/types';

export interface MockTrainDetails {
  train: Train;
  stations: Station[];
  routeCoordinates: [number, number][]; // [lng, lat]
  schedule: {
    stationCode: string;
    distanceKm: number;
    scheduledArrival: string | null;
    scheduledDeparture: string | null;
    platform: string;
    elevationMeters: number;
  }[];
}

export const MOCK_TRAINS: Record<string, MockTrainDetails> = {
  '20901': {
    train: {
      id: '20901',
      number: '20901',
      name: 'Vande Bharat Express',
      origin: 'Mumbai Central',
      originCode: 'MMCT',
      destination: 'Gandhinagar Capital',
      destinationCode: 'GNC',
      totalDistanceKm: 520,
      expectedDurationMinutes: 380,
      trainType: 'Vande Bharat',
    },
    stations: [
      { id: 'MMCT', code: 'MMCT', name: 'Mumbai Central', latitude: 18.9696, longitude: 72.8193, elevationMeters: 10, state: 'Maharashtra', platformCount: 8 },
      { id: 'BVI', code: 'BVI', name: 'Borivali', latitude: 19.2292, longitude: 72.8573, elevationMeters: 14, state: 'Maharashtra', platformCount: 10 },
      { id: 'VAPI', code: 'VAPI', name: 'Vapi', latitude: 20.3718, longitude: 72.9044, elevationMeters: 27, state: 'Gujarat', platformCount: 4 },
      { id: 'ST', code: 'ST', name: 'Surat', latitude: 21.2049, longitude: 72.8406, elevationMeters: 21, state: 'Gujarat', platformCount: 4 },
      { id: 'BRC', code: 'BRC', name: 'Vadodara Junction', latitude: 22.3107, longitude: 73.1926, elevationMeters: 36, state: 'Gujarat', platformCount: 7 },
      { id: 'ADI', code: 'ADI', name: 'Ahmedabad Junction', latitude: 23.0225, longitude: 72.6008, elevationMeters: 55, state: 'Gujarat', platformCount: 12 },
      { id: 'GNC', code: 'GNC', name: 'Gandhinagar Capital', latitude: 23.223, longitude: 72.6492, elevationMeters: 81, state: 'Gujarat', platformCount: 3 },
    ],
    routeCoordinates: [
      [72.8193, 18.9696],
      [72.835, 19.055],
      [72.8573, 19.2292],
      [72.889, 19.601],
      [72.9044, 20.3718],
      [72.8406, 21.2049],
      [73.011, 21.705],
      [73.1926, 22.3107],
      [72.880, 22.650],
      [72.6008, 23.0225],
      [72.6492, 23.2230],
    ],
    schedule: [
      { stationCode: 'MMCT', distanceKm: 0, scheduledArrival: null, scheduledDeparture: '06:00', platform: '5', elevationMeters: 10 },
      { stationCode: 'BVI', distanceKm: 30, scheduledArrival: '06:23', scheduledDeparture: '06:25', platform: '6', elevationMeters: 14 },
      { stationCode: 'VAPI', distanceKm: 168, scheduledArrival: '07:56', scheduledDeparture: '07:58', platform: '1', elevationMeters: 27 },
      { stationCode: 'ST', distanceKm: 263, scheduledArrival: '08:55', scheduledDeparture: '08:58', platform: '1', elevationMeters: 21 },
      { stationCode: 'BRC', distanceKm: 393, scheduledArrival: '10:13', scheduledDeparture: '10:18', platform: '2', elevationMeters: 36 },
      { stationCode: 'ADI', distanceKm: 493, scheduledArrival: '11:25', scheduledDeparture: '11:30', platform: '1', elevationMeters: 55 },
      { stationCode: 'GNC', distanceKm: 520, scheduledArrival: '12:25', scheduledDeparture: null, platform: '1', elevationMeters: 81 },
    ],
  },
  '12951': {
    train: {
      id: '12951',
      number: '12951',
      name: 'Mumbai Rajdhani Express',
      origin: 'Mumbai Central',
      originCode: 'MMCT',
      destination: 'New Delhi',
      destinationCode: 'NDLS',
      totalDistanceKm: 1384,
      expectedDurationMinutes: 940,
      trainType: 'Rajdhani',
    },
    stations: [
      { id: 'MMCT', code: 'MMCT', name: 'Mumbai Central', latitude: 18.9696, longitude: 72.8193, elevationMeters: 10, state: 'Maharashtra', platformCount: 8 },
      { id: 'ST', code: 'ST', name: 'Surat', latitude: 21.2049, longitude: 72.8406, elevationMeters: 21, state: 'Gujarat', platformCount: 4 },
      { id: 'BRC', code: 'BRC', name: 'Vadodara Junction', latitude: 22.3107, longitude: 73.1926, elevationMeters: 36, state: 'Gujarat', platformCount: 7 },
      { id: 'RTM', code: 'RTM', name: 'Ratlam Junction', latitude: 23.3341, longitude: 75.037, elevationMeters: 480, state: 'Madhya Pradesh', platformCount: 7 },
      { id: 'KOTA', code: 'KOTA', name: 'Kota Junction', latitude: 25.2138, longitude: 75.8648, elevationMeters: 256, state: 'Rajasthan', platformCount: 4 },
      { id: 'NDLS', code: 'NDLS', name: 'New Delhi', latitude: 28.6429, longitude: 77.2193, elevationMeters: 214, state: 'Delhi', platformCount: 16 },
    ],
    routeCoordinates: [
      [72.8193, 18.9696],
      [72.8406, 21.2049],
      [73.1926, 22.3107],
      [75.037, 23.3341],
      [75.8648, 25.2138],
      [77.2193, 28.6429],
    ],
    schedule: [
      { stationCode: 'MMCT', distanceKm: 0, scheduledArrival: null, scheduledDeparture: '17:00', platform: '1', elevationMeters: 10 },
      { stationCode: 'ST', distanceKm: 263, scheduledArrival: '19:43', scheduledDeparture: '19:48', platform: '1', elevationMeters: 21 },
      { stationCode: 'BRC', distanceKm: 393, scheduledArrival: '21:06', scheduledDeparture: '21:16', platform: '2', elevationMeters: 36 },
      { stationCode: 'RTM', distanceKm: 653, scheduledArrival: '00:25', scheduledDeparture: '00:28', platform: '5', elevationMeters: 480 },
      { stationCode: 'KOTA', distanceKm: 920, scheduledArrival: '03:15', scheduledDeparture: '03:25', platform: '1', elevationMeters: 256 },
      { stationCode: 'NDLS', distanceKm: 1384, scheduledArrival: '08:32', scheduledDeparture: null, platform: '3', elevationMeters: 214 },
    ],
  },
  '12002': {
    train: {
      id: '12002',
      number: '12002',
      name: 'Bhopal Shatabdi Express',
      origin: 'New Delhi',
      originCode: 'NDLS',
      destination: 'Rani Kamlapati (Bhopal)',
      destinationCode: 'RKMP',
      totalDistanceKm: 708,
      expectedDurationMinutes: 505,
      trainType: 'Shatabdi',
    },
    stations: [
      { id: 'NDLS', code: 'NDLS', name: 'New Delhi', latitude: 28.6429, longitude: 77.2193, elevationMeters: 214, state: 'Delhi', platformCount: 16 },
      { id: 'MTJ', code: 'MTJ', name: 'Mathura Junction', latitude: 27.4924, longitude: 77.6737, elevationMeters: 177, state: 'Uttar Pradesh', platformCount: 10 },
      { id: 'AGC', code: 'AGC', name: 'Agra Cantt', latitude: 27.1577, longitude: 77.9912, elevationMeters: 167, state: 'Uttar Pradesh', platformCount: 6 },
      { id: 'GWL', code: 'GWL', name: 'Gwalior Junction', latitude: 26.2183, longitude: 78.1828, elevationMeters: 212, state: 'Madhya Pradesh', platformCount: 4 },
      { id: 'VGLJ', code: 'VGLJ', name: 'VGL Jhansi Junction', latitude: 25.4484, longitude: 78.5685, elevationMeters: 258, state: 'Uttar Pradesh', platformCount: 8 },
      { id: 'BPL', code: 'BPL', name: 'Bhopal Junction', latitude: 23.2599, longitude: 77.4126, elevationMeters: 523, state: 'Madhya Pradesh', platformCount: 6 },
      { id: 'RKMP', code: 'RKMP', name: 'Rani Kamlapati', latitude: 23.2045, longitude: 77.4385, elevationMeters: 531, state: 'Madhya Pradesh', platformCount: 5 },
    ],
    routeCoordinates: [
      [77.2193, 28.6429],
      [77.6737, 27.4924],
      [77.9912, 27.1577],
      [78.1828, 26.2183],
      [78.5685, 25.4484],
      [77.4126, 23.2599],
      [77.4385, 23.2045],
    ],
    schedule: [
      { stationCode: 'NDLS', distanceKm: 0, scheduledArrival: null, scheduledDeparture: '06:00', platform: '1', elevationMeters: 214 },
      { stationCode: 'MTJ', distanceKm: 141, scheduledArrival: '07:19', scheduledDeparture: '07:20', platform: '1', elevationMeters: 177 },
      { stationCode: 'AGC', distanceKm: 195, scheduledArrival: '07:50', scheduledDeparture: '07:55', platform: '1', elevationMeters: 167 },
      { stationCode: 'GWL', distanceKm: 313, scheduledArrival: '09:23', scheduledDeparture: '09:28', platform: '1', elevationMeters: 212 },
      { stationCode: 'VGLJ', distanceKm: 411, scheduledArrival: '10:45', scheduledDeparture: '10:50', platform: '1', elevationMeters: 258 },
      { stationCode: 'BPL', distanceKm: 702, scheduledArrival: '14:05', scheduledDeparture: '14:10', platform: '1', elevationMeters: 523 },
      { stationCode: 'RKMP', distanceKm: 708, scheduledArrival: '14:25', scheduledDeparture: null, platform: '1', elevationMeters: 531 },
    ],
  },
  '22436': {
    train: {
      id: '22436',
      number: '22436',
      name: 'Vande Bharat Express',
      origin: 'New Delhi',
      originCode: 'NDLS',
      destination: 'Varanasi Junction',
      destinationCode: 'BSB',
      totalDistanceKm: 759,
      expectedDurationMinutes: 480,
      trainType: 'Vande Bharat',
    },
    stations: [
      { id: 'NDLS', code: 'NDLS', name: 'New Delhi', latitude: 28.6429, longitude: 77.2193, elevationMeters: 214, state: 'Delhi', platformCount: 16 },
      { id: 'CNB', code: 'CNB', name: 'Kanpur Central', latitude: 26.4547, longitude: 80.3507, elevationMeters: 126, state: 'Uttar Pradesh', platformCount: 10 },
      { id: 'PRYJ', code: 'PRYJ', name: 'Prayagraj Junction', latitude: 25.4497, longitude: 81.8286, elevationMeters: 98, state: 'Uttar Pradesh', platformCount: 10 },
      { id: 'BSB', code: 'BSB', name: 'Varanasi Junction', latitude: 25.3284, longitude: 82.9863, elevationMeters: 76, state: 'Uttar Pradesh', platformCount: 9 },
    ],
    routeCoordinates: [
      [77.2193, 28.6429],
      [80.3507, 26.4547],
      [81.8286, 25.4497],
      [82.9863, 25.3284],
    ],
    schedule: [
      { stationCode: 'NDLS', distanceKm: 0, scheduledArrival: null, scheduledDeparture: '06:00', platform: '16', elevationMeters: 214 },
      { stationCode: 'CNB', distanceKm: 440, scheduledArrival: '10:08', scheduledDeparture: '10:10', platform: '5', elevationMeters: 126 },
      { stationCode: 'PRYJ', distanceKm: 634, scheduledArrival: '12:08', scheduledDeparture: '12:10', platform: '6', elevationMeters: 98 },
      { stationCode: 'BSB', distanceKm: 759, scheduledArrival: '14:00', scheduledDeparture: null, platform: '1', elevationMeters: 76 },
    ],
  },
  '12301': {
    train: {
      id: '12301',
      number: '12301',
      name: 'Howrah Rajdhani Express',
      origin: 'Howrah Junction',
      originCode: 'HWH',
      destination: 'New Delhi',
      destinationCode: 'NDLS',
      totalDistanceKm: 1451,
      expectedDurationMinutes: 1025,
      trainType: 'Rajdhani',
    },
    stations: [
      { id: 'HWH', code: 'HWH', name: 'Howrah Junction', latitude: 22.5839, longitude: 88.3426, elevationMeters: 12, state: 'West Bengal', platformCount: 23 },
      { id: 'ASN', code: 'ASN', name: 'Asansol Junction', latitude: 23.6841, longitude: 86.9649, elevationMeters: 126, state: 'West Bengal', platformCount: 7 },
      { id: 'DHN', code: 'DHN', name: 'Dhanbad Junction', latitude: 23.7918, longitude: 86.4304, elevationMeters: 232, state: 'Jharkhand', platformCount: 8 },
      { id: 'GAYA', code: 'GAYA', name: 'Gaya Junction', latitude: 24.8028, longitude: 84.9995, elevationMeters: 117, state: 'Bihar', platformCount: 9 },
      { id: 'DDU', code: 'DDU', name: 'Pt. Deen Dayal Upadhyaya', latitude: 25.2796, longitude: 83.1187, elevationMeters: 78, state: 'Uttar Pradesh', platformCount: 8 },
      { id: 'PRYJ', code: 'PRYJ', name: 'Prayagraj Junction', latitude: 25.4497, longitude: 81.8286, elevationMeters: 98, state: 'Uttar Pradesh', platformCount: 10 },
      { id: 'CNB', code: 'CNB', name: 'Kanpur Central', latitude: 26.4547, longitude: 80.3507, elevationMeters: 126, state: 'Uttar Pradesh', platformCount: 10 },
      { id: 'NDLS', code: 'NDLS', name: 'New Delhi', latitude: 28.6429, longitude: 77.2193, elevationMeters: 214, state: 'Delhi', platformCount: 16 },
    ],
    routeCoordinates: [
      [88.3426, 22.5839],
      [86.9649, 23.6841],
      [86.4304, 23.7918],
      [84.9995, 24.8028],
      [83.1187, 25.2796],
      [81.8286, 25.4497],
      [80.3507, 26.4547],
      [77.2193, 28.6429],
    ],
    schedule: [
      { stationCode: 'HWH', distanceKm: 0, scheduledArrival: null, scheduledDeparture: '16:50', platform: '9', elevationMeters: 12 },
      { stationCode: 'ASN', distanceKm: 200, scheduledArrival: '18:57', scheduledDeparture: '19:00', platform: '4', elevationMeters: 126 },
      { stationCode: 'DHN', distanceKm: 259, scheduledArrival: '19:55', scheduledDeparture: '20:00', platform: '3', elevationMeters: 232 },
      { stationCode: 'GAYA', distanceKm: 459, scheduledArrival: '22:31', scheduledDeparture: '22:34', platform: '1', elevationMeters: 117 },
      { stationCode: 'DDU', distanceKm: 664, scheduledArrival: '00:45', scheduledDeparture: '00:55', platform: '7', elevationMeters: 78 },
      { stationCode: 'PRYJ', distanceKm: 817, scheduledArrival: '02:33', scheduledDeparture: '02:35', platform: '1', elevationMeters: 98 },
      { stationCode: 'CNB', distanceKm: 1011, scheduledArrival: '04:40', scheduledDeparture: '04:45', platform: '1', elevationMeters: 126 },
      { stationCode: 'NDLS', distanceKm: 1451, scheduledArrival: '10:05', scheduledDeparture: null, platform: '4', elevationMeters: 214 },
    ],
  },
  '12626': {
    train: {
      id: '12626',
      number: '12626',
      name: 'Kerala Express',
      origin: 'New Delhi',
      originCode: 'NDLS',
      destination: 'Thiruvananthapuram Central',
      destinationCode: 'TVC',
      totalDistanceKm: 3031,
      expectedDurationMinutes: 3030,
      trainType: 'Superfast',
    },
    stations: [
      { id: 'NDLS', code: 'NDLS', name: 'New Delhi', latitude: 28.6429, longitude: 77.2193, elevationMeters: 214, state: 'Delhi', platformCount: 16 },
      { id: 'AGC', code: 'AGC', name: 'Agra Cantt', latitude: 27.1577, longitude: 77.9912, elevationMeters: 167, state: 'Uttar Pradesh', platformCount: 6 },
      { id: 'GWL', code: 'GWL', name: 'Gwalior Junction', latitude: 26.2183, longitude: 78.1828, elevationMeters: 212, state: 'Madhya Pradesh', platformCount: 4 },
      { id: 'BPL', code: 'BPL', name: 'Bhopal Junction', latitude: 23.2599, longitude: 77.4126, elevationMeters: 523, state: 'Madhya Pradesh', platformCount: 6 },
      { id: 'NGP', code: 'NGP', name: 'Nagpur Junction', latitude: 21.1524, longitude: 79.0888, elevationMeters: 312, state: 'Maharashtra', platformCount: 8 },
      { id: 'BZA', code: 'BZA', name: 'Vijayawada Junction', latitude: 16.5186, longitude: 80.6201, elevationMeters: 21, state: 'Andhra Pradesh', platformCount: 10 },
      { id: 'MAS', code: 'MAS', name: 'MGR Chennai Central', latitude: 13.0827, longitude: 80.2707, elevationMeters: 10, state: 'Tamil Nadu', platformCount: 15 },
      { id: 'TVC', code: 'TVC', name: 'Thiruvananthapuram', latitude: 8.4875, longitude: 76.9525, elevationMeters: 9, state: 'Kerala', platformCount: 5 },
    ],
    routeCoordinates: [
      [77.2193, 28.6429],
      [77.9912, 27.1577],
      [78.1828, 26.2183],
      [77.4126, 23.2599],
      [79.0888, 21.1524],
      [80.6201, 16.5186],
      [80.2707, 13.0827],
      [76.9525, 8.4875],
    ],
    schedule: [
      { stationCode: 'NDLS', distanceKm: 0, scheduledArrival: null, scheduledDeparture: '20:10', platform: '3', elevationMeters: 214 },
      { stationCode: 'AGC', distanceKm: 195, scheduledArrival: '22:20', scheduledDeparture: '22:25', platform: '1', elevationMeters: 167 },
      { stationCode: 'GWL', distanceKm: 313, scheduledArrival: '23:43', scheduledDeparture: '23:45', platform: '1', elevationMeters: 212 },
      { stationCode: 'BPL', distanceKm: 702, scheduledArrival: '05:20', scheduledDeparture: '05:25', platform: '1', elevationMeters: 523 },
      { stationCode: 'NGP', distanceKm: 1092, scheduledArrival: '11:45', scheduledDeparture: '11:50', platform: '2', elevationMeters: 312 },
      { stationCode: 'BZA', distanceKm: 1757, scheduledArrival: '22:10', scheduledDeparture: '22:20', platform: '6', elevationMeters: 21 },
      { stationCode: 'MAS', distanceKm: 2187, scheduledArrival: '04:30', scheduledDeparture: '04:55', platform: '4', elevationMeters: 10 },
      { stationCode: 'TVC', distanceKm: 3031, scheduledArrival: '18:05', scheduledDeparture: null, platform: '1', elevationMeters: 9 },
    ],
  },
};

// Corridor templates for synthesizing realistic dynamic routes for any train number
const CORRIDORS: Array<{
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  totalDistanceKm: number;
  expectedDurationMinutes: number;
  stations: Station[];
  schedule: Array<{
    stationCode: string;
    distanceKm: number;
    scheduledArrival: string | null;
    scheduledDeparture: string | null;
    platform: string;
    elevationMeters: number;
  }>;
}> = [
  {
    origin: 'New Delhi',
    originCode: 'NDLS',
    destination: 'Lucknow NR',
    destinationCode: 'LKO',
    totalDistanceKm: 492,
    expectedDurationMinutes: 480,
    stations: [
      { id: 'NDLS', code: 'NDLS', name: 'New Delhi', latitude: 28.6429, longitude: 77.2193, elevationMeters: 214, state: 'Delhi', platformCount: 16 },
      { id: 'GZB', code: 'GZB', name: 'Ghaziabad', latitude: 28.6529, longitude: 77.4282, elevationMeters: 213, state: 'Uttar Pradesh', platformCount: 6 },
      { id: 'MB', code: 'MB', name: 'Moradabad', latitude: 28.8314, longitude: 78.7654, elevationMeters: 193, state: 'Uttar Pradesh', platformCount: 5 },
      { id: 'BE', code: 'BE', name: 'Bareilly', latitude: 28.3381, longitude: 79.4103, elevationMeters: 168, state: 'Uttar Pradesh', platformCount: 4 },
      { id: 'SPN', code: 'SPN', name: 'Shahjahanpur', latitude: 27.8934, longitude: 79.9049, elevationMeters: 153, state: 'Uttar Pradesh', platformCount: 4 },
      { id: 'LKO', code: 'LKO', name: 'Lucknow NR', latitude: 26.8312, longitude: 80.9244, elevationMeters: 123, state: 'Uttar Pradesh', platformCount: 9 },
    ],
    schedule: [
      { stationCode: 'NDLS', distanceKm: 0, scheduledArrival: null, scheduledDeparture: '07:00', platform: '9', elevationMeters: 214 },
      { stationCode: 'GZB', distanceKm: 26, scheduledArrival: '07:43', scheduledDeparture: '07:45', platform: '2', elevationMeters: 213 },
      { stationCode: 'MB', distanceKm: 167, scheduledArrival: '09:50', scheduledDeparture: '09:58', platform: '1', elevationMeters: 193 },
      { stationCode: 'BE', distanceKm: 257, scheduledArrival: '11:15', scheduledDeparture: '11:17', platform: '1', elevationMeters: 168 },
      { stationCode: 'SPN', distanceKm: 328, scheduledArrival: '12:20', scheduledDeparture: '12:22', platform: '1', elevationMeters: 153 },
      { stationCode: 'LKO', distanceKm: 492, scheduledArrival: '15:00', scheduledDeparture: null, platform: '4', elevationMeters: 123 },
    ],
  },
  {
    origin: 'Hyderabad Deccan',
    originCode: 'HYB',
    destination: 'New Delhi',
    destinationCode: 'NDLS',
    totalDistanceKm: 1682,
    expectedDurationMinutes: 1560,
    stations: [
      { id: 'HYB', code: 'HYB', name: 'Hyderabad Deccan', latitude: 17.3916, longitude: 78.4682, elevationMeters: 509, state: 'Telangana', platformCount: 6 },
      { id: 'SC', code: 'SC', name: 'Secunderabad', latitude: 17.4334, longitude: 78.5044, elevationMeters: 542, state: 'Telangana', platformCount: 10 },
      { id: 'KZJ', code: 'KZJ', name: 'Kazipet Junction', latitude: 17.9782, longitude: 79.5167, elevationMeters: 286, state: 'Telangana', platformCount: 4 },
      { id: 'BPQ', code: 'BPQ', name: 'Balharshah', latitude: 19.8601, longitude: 79.3499, elevationMeters: 193, state: 'Maharashtra', platformCount: 5 },
      { id: 'NGP', code: 'NGP', name: 'Nagpur Junction', latitude: 21.1524, longitude: 79.0888, elevationMeters: 312, state: 'Maharashtra', platformCount: 8 },
      { id: 'BPL', code: 'BPL', name: 'Bhopal Junction', latitude: 23.2599, longitude: 77.4126, elevationMeters: 523, state: 'Madhya Pradesh', platformCount: 6 },
      { id: 'GWL', code: 'GWL', name: 'Gwalior Junction', latitude: 26.2183, longitude: 78.1828, elevationMeters: 212, state: 'Madhya Pradesh', platformCount: 4 },
      { id: 'AGC', code: 'AGC', name: 'Agra Cantt', latitude: 27.1577, longitude: 77.9912, elevationMeters: 167, state: 'Uttar Pradesh', platformCount: 6 },
      { id: 'NDLS', code: 'NDLS', name: 'New Delhi', latitude: 28.6429, longitude: 77.2193, elevationMeters: 214, state: 'Delhi', platformCount: 16 },
    ],
    schedule: [
      { stationCode: 'HYB', distanceKm: 0, scheduledArrival: null, scheduledDeparture: '06:00', platform: '5', elevationMeters: 509 },
      { stationCode: 'SC', distanceKm: 9, scheduledArrival: '06:20', scheduledDeparture: '06:25', platform: '1', elevationMeters: 542 },
      { stationCode: 'KZJ', distanceKm: 141, scheduledArrival: '08:13', scheduledDeparture: '08:15', platform: '1', elevationMeters: 286 },
      { stationCode: 'BPQ', distanceKm: 376, scheduledArrival: '12:00', scheduledDeparture: '12:05', platform: '2', elevationMeters: 193 },
      { stationCode: 'NGP', distanceKm: 584, scheduledArrival: '15:20', scheduledDeparture: '15:25', platform: '1', elevationMeters: 312 },
      { stationCode: 'BPL', distanceKm: 974, scheduledArrival: '21:40', scheduledDeparture: '21:50', platform: '3', elevationMeters: 523 },
      { stationCode: 'GWL', distanceKm: 1363, scheduledArrival: '03:10', scheduledDeparture: '03:12', platform: '4', elevationMeters: 212 },
      { stationCode: 'AGC', distanceKm: 1481, scheduledArrival: '04:45', scheduledDeparture: '04:47', platform: '2', elevationMeters: 167 },
      { stationCode: 'NDLS', distanceKm: 1682, scheduledArrival: '08:00', scheduledDeparture: null, platform: '3', elevationMeters: 214 },
    ],
  },
  {
    origin: 'KSR Bengaluru',
    originCode: 'SBC',
    destination: 'MGR Chennai Central',
    destinationCode: 'MAS',
    totalDistanceKm: 359,
    expectedDurationMinutes: 260,
    stations: [
      { id: 'SBC', code: 'SBC', name: 'KSR Bengaluru', latitude: 12.9784, longitude: 77.5684, elevationMeters: 920, state: 'Karnataka', platformCount: 10 },
      { id: 'BNC', code: 'BNC', name: 'Bengaluru Cantt', latitude: 12.9934, longitude: 77.5982, elevationMeters: 915, state: 'Karnataka', platformCount: 3 },
      { id: 'KJM', code: 'KJM', name: 'Krishnarajapuram', latitude: 13.0016, longitude: 77.6775, elevationMeters: 890, state: 'Karnataka', platformCount: 4 },
      { id: 'BWT', code: 'BWT', name: 'Bangarapet', latitude: 12.9984, longitude: 78.2018, elevationMeters: 840, state: 'Karnataka', platformCount: 5 },
      { id: 'JTJ', code: 'JTJ', name: 'Jolarpettai', latitude: 12.5685, longitude: 78.5831, elevationMeters: 380, state: 'Tamil Nadu', platformCount: 5 },
      { id: 'KPD', code: 'KPD', name: 'Katpadi Junction', latitude: 12.9698, longitude: 79.1384, elevationMeters: 215, state: 'Tamil Nadu', platformCount: 5 },
      { id: 'AJJ', code: 'AJJ', name: 'Arakkonam Junction', latitude: 13.0784, longitude: 79.6685, elevationMeters: 85, state: 'Tamil Nadu', platformCount: 8 },
      { id: 'MAS', code: 'MAS', name: 'MGR Chennai Central', latitude: 13.0827, longitude: 80.2707, elevationMeters: 10, state: 'Tamil Nadu', platformCount: 15 },
    ],
    schedule: [
      { stationCode: 'SBC', distanceKm: 0, scheduledArrival: null, scheduledDeparture: '06:00', platform: '7', elevationMeters: 920 },
      { stationCode: 'BNC', distanceKm: 4, scheduledArrival: '06:09', scheduledDeparture: '06:10', platform: '2', elevationMeters: 915 },
      { stationCode: 'KJM', distanceKm: 14, scheduledArrival: '06:22', scheduledDeparture: '06:24', platform: '2', elevationMeters: 890 },
      { stationCode: 'BWT', distanceKm: 70, scheduledArrival: '07:05', scheduledDeparture: '07:07', platform: '4', elevationMeters: 840 },
      { stationCode: 'JTJ', distanceKm: 145, scheduledArrival: '08:20', scheduledDeparture: '08:22', platform: '3', elevationMeters: 380 },
      { stationCode: 'KPD', distanceKm: 229, scheduledArrival: '09:28', scheduledDeparture: '09:30', platform: '2', elevationMeters: 215 },
      { stationCode: 'AJJ', distanceKm: 290, scheduledArrival: '10:18', scheduledDeparture: '10:20', platform: '1', elevationMeters: 85 },
      { stationCode: 'MAS', distanceKm: 359, scheduledArrival: '11:20', scheduledDeparture: null, platform: '2', elevationMeters: 10 },
    ],
  },
  {
    origin: 'New Delhi',
    originCode: 'NDLS',
    destination: 'Mumbai Central',
    destinationCode: 'MMCT',
    totalDistanceKm: 1384,
    expectedDurationMinutes: 980,
    stations: [
      { id: 'NDLS', code: 'NDLS', name: 'New Delhi', latitude: 28.6429, longitude: 77.2193, elevationMeters: 214, state: 'Delhi', platformCount: 16 },
      { id: 'MTJ', code: 'MTJ', name: 'Mathura Junction', latitude: 27.4924, longitude: 77.6737, elevationMeters: 177, state: 'Uttar Pradesh', platformCount: 10 },
      { id: 'KOTA', code: 'KOTA', name: 'Kota Junction', latitude: 25.2138, longitude: 75.8648, elevationMeters: 256, state: 'Rajasthan', platformCount: 4 },
      { id: 'RTM', code: 'RTM', name: 'Ratlam Junction', latitude: 23.3341, longitude: 75.037, elevationMeters: 480, state: 'Madhya Pradesh', platformCount: 7 },
      { id: 'BRC', code: 'BRC', name: 'Vadodara Junction', latitude: 22.3107, longitude: 73.1926, elevationMeters: 36, state: 'Gujarat', platformCount: 7 },
      { id: 'ST', code: 'ST', name: 'Surat', latitude: 21.2049, longitude: 72.8406, elevationMeters: 21, state: 'Gujarat', platformCount: 4 },
      { id: 'MMCT', code: 'MMCT', name: 'Mumbai Central', latitude: 18.9696, longitude: 72.8193, elevationMeters: 10, state: 'Maharashtra', platformCount: 8 },
    ],
    schedule: [
      { stationCode: 'NDLS', distanceKm: 0, scheduledArrival: null, scheduledDeparture: '08:00', platform: '2', elevationMeters: 214 },
      { stationCode: 'MTJ', distanceKm: 141, scheduledArrival: '09:40', scheduledDeparture: '09:45', platform: '1', elevationMeters: 177 },
      { stationCode: 'KOTA', distanceKm: 465, scheduledArrival: '14:15', scheduledDeparture: '14:25', platform: '1', elevationMeters: 256 },
      { stationCode: 'RTM', distanceKm: 731, scheduledArrival: '18:10', scheduledDeparture: '18:15', platform: '4', elevationMeters: 480 },
      { stationCode: 'BRC', distanceKm: 991, scheduledArrival: '22:00', scheduledDeparture: '22:10', platform: '2', elevationMeters: 36 },
      { stationCode: 'ST', distanceKm: 1121, scheduledArrival: '23:45', scheduledDeparture: '23:50', platform: '1', elevationMeters: 21 },
      { stationCode: 'MMCT', distanceKm: 1384, scheduledArrival: '05:30', scheduledDeparture: null, platform: '1', elevationMeters: 10 },
    ],
  },
];

// Creates a dynamic fallback for ANY unknown 5-digit Indian train number
export function getOrCreateDynamicTrain(trainId: string): MockTrainDetails {
  if (MOCK_TRAINS[trainId]) {
    return MOCK_TRAINS[trainId];
  }

  const num = trainId.replace(/\D/g, '') || '12345';
  const numericVal = parseInt(num, 10) || 12345;
  const corridorIndex = numericVal % CORRIDORS.length;
  const corridor = CORRIDORS[corridorIndex];

  const name = `Express #${num}`;
  const routeCoordinates: [number, number][] = corridor.stations.map((s) => [s.longitude, s.latitude]);

  return {
    train: {
      id: num,
      number: num,
      name,
      origin: corridor.origin,
      originCode: corridor.originCode,
      destination: corridor.destination,
      destinationCode: corridor.destinationCode,
      totalDistanceKm: corridor.totalDistanceKm,
      expectedDurationMinutes: corridor.expectedDurationMinutes,
      trainType: num.startsWith('2') ? 'Vande Bharat' : num.startsWith('12') ? 'Superfast' : 'Express',
    },
    stations: corridor.stations,
    routeCoordinates,
    schedule: corridor.schedule,
  };
}

// Generates live data with realistic movement and calculated delays
export function generateLiveStatus(trainId: string): LiveJourneyStatus | null {
  const trainDetail = getOrCreateDynamicTrain(trainId);
  const { train, stations, routeCoordinates, schedule } = trainDetail;

  // Simulate active progress (~62% complete, delayed by 12 mins)
  const completionRatio = 0.58;
  const coveredKm = Math.round(train.totalDistanceKm * completionRatio);
  const remainingKm = train.totalDistanceKm - coveredKm;
  const delayMinutes: number = 8;

  // Station progress
  const passedIndex = Math.floor(schedule.length * completionRatio);
  const currentIndex = Math.min(passedIndex, schedule.length - 2);
  const nextIndex = currentIndex + 1;

  const currStationObj = stations.find((s) => s.code === schedule[currentIndex].stationCode) || stations[0];
  const nextStationObj = stations.find((s) => s.code === schedule[nextIndex].stationCode) || stations[stations.length - 1];

  // Calculate simulated coordinate between current and next station
  const stationProgress = (completionRatio * (schedule.length - 1)) - currentIndex;
  const currentLng = currStationObj.longitude + (nextStationObj.longitude - currStationObj.longitude) * stationProgress;
  const currentLat = currStationObj.latitude + (nextStationObj.latitude - currStationObj.latitude) * stationProgress;

  const currentStationEvent: StationEvent = {
    journeyId: `J-${train.id}`,
    stationId: currStationObj.id,
    station: currStationObj,
    distanceFromOriginKm: schedule[currentIndex].distanceKm,
    scheduledArrival: schedule[currentIndex].scheduledArrival,
    actualArrival: schedule[currentIndex].scheduledArrival ? addMinutes(schedule[currentIndex].scheduledArrival!, delayMinutes) : null,
    scheduledDeparture: schedule[currentIndex].scheduledDeparture,
    actualDeparture: schedule[currentIndex].scheduledDeparture ? addMinutes(schedule[currentIndex].scheduledDeparture!, delayMinutes) : null,
    delayMinutes: delayMinutes,
    status: 'current',
    platform: schedule[currentIndex].platform,
  };

  const nextStationEvent: StationEvent = {
    journeyId: `J-${train.id}`,
    stationId: nextStationObj.id,
    station: nextStationObj,
    distanceFromOriginKm: schedule[nextIndex].distanceKm,
    scheduledArrival: schedule[nextIndex].scheduledArrival,
    actualArrival: schedule[nextIndex].scheduledArrival ? addMinutes(schedule[nextIndex].scheduledArrival!, delayMinutes) : null,
    scheduledDeparture: schedule[nextIndex].scheduledDeparture,
    actualDeparture: schedule[nextIndex].scheduledDeparture ? addMinutes(schedule[nextIndex].scheduledDeparture!, delayMinutes) : null,
    delayMinutes: delayMinutes,
    status: 'upcoming',
    platform: schedule[nextIndex].platform,
  };

  return {
    id: `J-${train.id}`,
    trainId: train.id,
    train,
    serviceDate: new Date().toISOString().split('T')[0],
    position: {
      latitude: currentLat,
      longitude: currentLng,
      speedKmph: 104,
      headingDegrees: 45,
    },
    currentStation: currentStationEvent,
    nextStation: nextStationEvent,
    delayMinutes,
    distanceCoveredKm: coveredKm,
    distanceRemainingKm: remainingKm,
    completionPercentage: Math.round(completionRatio * 100),
    lastUpdated: new Date().toISOString(),
    statusText: `Running ${delayMinutes === 0 ? 'on time' : `${delayMinutes} mins late`}. Departed ${currStationObj.name}, approaching ${nextStationObj.name}.`,
    hasLiveData: true,
    isStale: false,
  };
}

function addMinutes(timeStr: string, mins: number): string {
  const [h, m] = timeStr.split(':').map(Number);
  const total = h * 60 + m + mins;
  const newH = Math.floor((total / 60) % 24).toString().padStart(2, '0');
  const newM = (total % 60).toString().padStart(2, '0');
  return `${newH}:${newM}`;
}
