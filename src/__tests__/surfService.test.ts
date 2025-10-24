import { SurfService } from '../services/surfService';
import { WeatherService } from '../services/weatherService';
import { SurfSpot } from '../types/surf';

// Mock the WeatherService
jest.mock('../services/weatherService');

describe('SurfService', () => {
  let surfService: SurfService;
  let mockWeatherService: jest.Mocked<WeatherService>;

  beforeEach(() => {
    mockWeatherService = {
      getCurrentWeather: jest.fn(),
      getWindData: jest.fn(),
      getTideData: jest.fn(),
      getForecast: jest.fn()
    } as any;

    surfService = new SurfService(mockWeatherService);
  });

  describe('analyzeSurfConditions', () => {
    it('should analyze surf conditions successfully', async () => {
      // Mock data
      const mockWeather = {
        temperature: 72,
        humidity: 65,
        pressure: 1013,
        visibility: 10,
        uvIndex: 5
      };

      const mockWind = {
        speed: 12,
        direction: 270,
        gust: 15
      };

      const mockTides = [{
        height: 3.2,
        time: new Date(),
        type: 'high' as const
      }];

      // Setup mocks
      mockWeatherService.getCurrentWeather.mockResolvedValue(mockWeather);
      mockWeatherService.getWindData.mockResolvedValue(mockWind);
      mockWeatherService.getTideData.mockResolvedValue(mockTides);

      const testSpot: SurfSpot = {
        id: 'test-1',
        name: 'Test Beach',
        location: {
          latitude: 34.0369,
          longitude: -118.6774,
          address: 'Test, CA'
        },
        breakType: 'beach_break',
        difficulty: 'intermediate',
        bestConditions: {
          windDirection: [270, 315],
          swellDirection: [200, 250],
          tideRange: [2, 6]
        }
      };

      // Execute
      const result = await surfService.analyzeSurfConditions(testSpot);

      // Assertions
      expect(result).toBeDefined();
      expect(result.location).toBe('Test Beach');
      expect(result.waves).toBeDefined();
      expect(result.wind).toBeDefined();
      expect(result.weather).toBeDefined();
      expect(result.rating).toBeGreaterThanOrEqual(1);
      expect(result.rating).toBeLessThanOrEqual(5);
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      const testSpot: SurfSpot = {
        id: 'test-1',
        name: 'Test Beach',
        location: {
          latitude: 34.0369,
          longitude: -118.6774,
          address: 'Test, CA'
        },
        breakType: 'beach_break',
        difficulty: 'intermediate',
        bestConditions: {
          windDirection: [270, 315],
          swellDirection: [200, 250],
          tideRange: [2, 6]
        }
      };

      // Mock error
      mockWeatherService.getCurrentWeather.mockRejectedValue(new Error('API Error'));

      // Execute and expect error
      await expect(surfService.analyzeSurfConditions(testSpot))
        .rejects.toThrow('Failed to analyze surf conditions');
    });
  });

  describe('getBestSurfTimes', () => {
    it('should return best surf times for a spot', async () => {
      const testSpot: SurfSpot = {
        id: 'test-1',
        name: 'Test Beach',
        location: {
          latitude: 34.0369,
          longitude: -118.6774,
          address: 'Test, CA'
        },
        breakType: 'beach_break',
        difficulty: 'intermediate',
        bestConditions: {
          windDirection: [270, 315],
          swellDirection: [200, 250],
          tideRange: [2, 6]
        }
      };

      const result = await surfService.getBestSurfTimes(testSpot, 2);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(result[0]).toHaveProperty('date');
      expect(result[0]).toHaveProperty('morning');
      expect(result[0]).toHaveProperty('afternoon');
    });
  });
});
