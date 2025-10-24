import { WaveData, SurfConditions, SurfSpot, SurfRating, WaveQuality } from '../types/surf';
import { WeatherService } from './weatherService';

/**
 * Service for analyzing surf conditions and providing recommendations
 */
export class SurfService {
  private weatherService: WeatherService;

  constructor(weatherService: WeatherService) {
    this.weatherService = weatherService;
  }

  /**
   * Analyze surf conditions for a given spot
   */
  async analyzeSurfConditions(spot: SurfSpot): Promise<SurfConditions> {
    try {
      // Fetch weather and ocean data
      const [weather, wind, tides] = await Promise.all([
        this.weatherService.getCurrentWeather(spot.location.latitude, spot.location.longitude),
        this.weatherService.getWindData(spot.location.latitude, spot.location.longitude),
        this.weatherService.getTideData(spot.location.latitude, spot.location.longitude)
      ]);

      // Generate wave data (mock - in real implementation, would use wave buoy data)
      const firstTide = tides[0] || { height: 3, time: new Date(), type: 'high' as const };
      const waves = this.generateWaveData(wind, firstTide);

      // Calculate surf rating
      const rating = this.calculateSurfRating(waves, wind, weather, spot);

      // Generate recommendations
      const recommendations = this.generateRecommendations(waves, wind, weather, spot);

      return {
        location: spot.name,
        timestamp: new Date(),
        waves,
        wind,
        tide: firstTide,
        weather,
        rating,
        recommendations
      };
    } catch (error) {
      throw new Error(`Failed to analyze surf conditions: ${error}`);
    }
  }

  /**
   * Generate wave data based on wind and tide conditions
   */
  private generateWaveData(wind: any, _tide: any): WaveData {
    // Mock wave generation - in real implementation, would use wave models
    const baseHeight = 2 + Math.random() * 4; // 2-6 feet
    const period = 8 + Math.random() * 8; // 8-16 seconds
    const direction = Math.random() * 360; // 0-360 degrees

    return {
      height: baseHeight,
      period,
      direction,
      quality: this.assessWaveQuality(baseHeight, period, wind.speed)
    };
  }

  /**
   * Assess wave quality based on conditions
   */
  private assessWaveQuality(height: number, period: number, windSpeed: number): WaveQuality {
    let score = 0;

    // Height scoring (2-6 feet is ideal)
    if (height >= 2 && height <= 6) score += 3;
    else if (height >= 1.5 && height <= 8) score += 2;
    else if (height >= 1 && height <= 10) score += 1;

    // Period scoring (8+ seconds is ideal)
    if (period >= 12) score += 3;
    else if (period >= 8) score += 2;
    else if (period >= 6) score += 1;

    // Wind scoring (lower is better)
    if (windSpeed <= 10) score += 3;
    else if (windSpeed <= 15) score += 2;
    else if (windSpeed <= 20) score += 1;

    if (score >= 8) return 'excellent';
    if (score >= 6) return 'good';
    if (score >= 4) return 'fair';
    return 'poor';
  }

  /**
   * Calculate overall surf rating
   */
  private calculateSurfRating(
    waves: WaveData, 
    wind: any, 
    _weather: any, 
    _spot: SurfSpot
  ): SurfRating {
    let rating = 1;

    // Wave height factor
    if (waves.height >= 3 && waves.height <= 6) rating += 1;
    if (waves.period >= 10) rating += 1;
    if (waves.quality === 'excellent' || waves.quality === 'good') rating += 1;
    if (wind.speed <= 15) rating += 1;

    // Ensure rating is between 1-5
    return Math.min(Math.max(rating, 1), 5) as SurfRating;
  }

  /**
   * Generate surf recommendations
   */
  private generateRecommendations(
    waves: WaveData, 
    wind: any, 
    weather: any, 
    spot: SurfSpot
  ): string[] {
    const recommendations: string[] = [];

    // Wave recommendations
    if (waves.height < 2) {
      recommendations.push('Waves are quite small - good for beginners or longboarding');
    } else if (waves.height > 8) {
      recommendations.push('Large waves - experienced surfers only');
    } else {
      recommendations.push('Good wave size for most skill levels');
    }

    // Wind recommendations
    if (wind.speed > 20) {
      recommendations.push('Strong winds - conditions may be choppy');
    } else if (wind.speed < 10) {
      recommendations.push('Light winds - clean conditions expected');
    }

    // Weather recommendations
    if (weather.uvIndex > 7) {
      recommendations.push('High UV index - wear sunscreen and protective gear');
    }

    if (weather.temperature < 60) {
      recommendations.push('Cold water - consider wearing a wetsuit');
    }

    // Skill level recommendations
    if (spot.difficulty === 'beginner' && waves.height > 4) {
      recommendations.push('Waves may be too large for beginners');
    }

    if (spot.difficulty === 'expert' && waves.height < 2) {
      recommendations.push('Waves may be too small for advanced surfers');
    }

    return recommendations;
  }

  /**
   * Get best surf times for a spot
   */
  async getBestSurfTimes(_spot: SurfSpot, days: number = 3): Promise<any[]> {
    const bestTimes: any[] = [];
    
    // Mock implementation - in real app, would analyze forecast data
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      // Mock best times (early morning and late afternoon)
      bestTimes.push({
        date,
        morning: {
          time: '6:00 AM',
          rating: 4,
          conditions: 'Clean conditions, light winds'
        },
        afternoon: {
          time: '4:00 PM',
          rating: 3,
          conditions: 'Moderate winds, good wave quality'
        }
      });
    }
    
    return bestTimes;
  }
}
