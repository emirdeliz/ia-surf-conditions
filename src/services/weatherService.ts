import axios, { AxiosResponse } from 'axios';
import { WeatherData, WindData, TideData } from '../types/surf';

/**
 * Service for fetching weather and ocean data from external APIs
 */
export class WeatherService {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(apiKey: string, baseUrl: string = 'https://api.openweathermap.org/data/2.5') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch current weather conditions for a location
   */
  async getCurrentWeather(latitude: number, longitude: number): Promise<WeatherData> {
    try {
      const response: AxiosResponse = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat: latitude,
          lon: longitude,
          appid: this.apiKey,
          units: 'imperial'
        }
      });

      const data = response.data;
      
      return {
        temperature: data.main.temp,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        visibility: data.visibility / 1609.34, // Convert meters to miles
        uvIndex: 0 // Would need UV API for accurate data
      };
    } catch (error) {
      throw new Error(`Failed to fetch weather data: ${error}`);
    }
  }

  /**
   * Fetch wind data for a location
   */
  async getWindData(latitude: number, longitude: number): Promise<WindData> {
    try {
      const response: AxiosResponse = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat: latitude,
          lon: longitude,
          appid: this.apiKey,
          units: 'imperial'
        }
      });

      const data = response.data;
      
      return {
        speed: data.wind.speed,
        direction: data.wind.deg,
        gust: data.wind.gust || data.wind.speed
      };
    } catch (error) {
      throw new Error(`Failed to fetch wind data: ${error}`);
    }
  }

  /**
   * Mock tide data (in real implementation, would use tide API)
   */
  async getTideData(_latitude: number, _longitude: number): Promise<TideData[]> {
    // Mock tide data - in real implementation, would use NOAA or similar API
    const now = new Date();
    const tides: TideData[] = [];
    
    // Generate mock tide data for next 24 hours
    for (let i = 0; i < 4; i++) {
      const time = new Date(now.getTime() + (i * 6 * 60 * 60 * 1000)); // Every 6 hours
      tides.push({
        height: 2.5 + Math.sin(i * Math.PI / 2) * 1.5,
        time,
        type: i % 2 === 0 ? 'high' : 'low'
      });
    }
    
    return tides;
  }

  /**
   * Get forecast data for multiple days
   */
  async getForecast(_latitude: number, _longitude: number, days: number = 5): Promise<WeatherData[]> {
    try {
      const response: AxiosResponse = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          lat: _latitude,
          lon: _longitude,
          appid: this.apiKey,
          units: 'imperial'
        }
      });

      const forecasts: WeatherData[] = [];
      const data = response.data;
      
      // Process 3-hourly forecasts and group by day
      for (let i = 0; i < Math.min(days * 8, data.list.length); i += 8) {
        const dayForecast = data.list[i];
        forecasts.push({
          temperature: dayForecast.main.temp,
          humidity: dayForecast.main.humidity,
          pressure: dayForecast.main.pressure,
          visibility: dayForecast.visibility / 1609.34,
          uvIndex: 0
        });
      }
      
      return forecasts;
    } catch (error) {
      throw new Error(`Failed to fetch forecast data: ${error}`);
    }
  }
}
