import { WeatherInfo } from '@railgaadi/types';

export class OpenWeatherProvider {
  private apiKey: string;
  private cache = new Map<string, { data: WeatherInfo; timestamp: number }>();
  private readonly CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENWEATHER_API_KEY || 'a3884add028a06812d3b873a1226b91c';
  }

  async getWeather(lat: number, lng: number): Promise<WeatherInfo> {
    const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.data;
    }

    if (!this.apiKey || this.apiKey === 'your_openweather_api_key_here') {
      return this.getFallbackWeather(lat, lng);
    }

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${this.apiKey}&units=metric`;
      const res = await fetch(url);

      if (!res.ok) {
        console.warn(`[OpenWeather] API returned ${res.status}. Falling back to region estimate.`);
        return this.getFallbackWeather(lat, lng);
      }

      const data = await res.json();

      const weatherInfo: WeatherInfo = {
        locationName: data.name || 'Station Surroundings',
        temperatureC: Math.round(data.main?.temp ?? 28),
        feelsLikeC: Math.round(data.main?.feels_like ?? 31),
        humidityPercentage: data.main?.humidity ?? 75,
        windSpeedKmph: Math.round((data.wind?.speed ?? 3.5) * 3.6),
        weatherCondition: data.weather?.[0]?.main || 'Scattered Clouds',
        icon: data.weather?.[0]?.icon || '02d',
        rainForecastPercent: data.rain ? 80 : data.weather?.[0]?.main?.toLowerCase().includes('rain') ? 70 : 20,
        uvIndex: 6,
      };

      this.cache.set(key, { data: weatherInfo, timestamp: Date.now() });
      return weatherInfo;
    } catch (e: any) {
      console.error('[OpenWeather] Error fetching weather:', e.message);
      return this.getFallbackWeather(lat, lng);
    }
  }

  private getFallbackWeather(lat: number, lng: number): WeatherInfo {
    // Estimate reasonable weather based on latitude and regional climate in India
    const isNorth = lat > 26;
    const isCoastal = lng > 87 || lng < 74;
    const baseTemp = isNorth ? 31 : isCoastal ? 30 : 28;

    return {
      locationName: isNorth ? 'Northern Plains Region' : isCoastal ? 'Coastal Rail Corridor' : 'Central Plateau Region',
      temperatureC: baseTemp,
      feelsLikeC: baseTemp + 4,
      humidityPercentage: isCoastal ? 82 : 72,
      windSpeedKmph: 12,
      weatherCondition: 'Scattered Clouds',
      icon: '03d',
      rainForecastPercent: 25,
      uvIndex: 5,
    };
  }
}
