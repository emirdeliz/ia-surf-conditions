/**
 * TypeScript interfaces for surf conditions data
 */

export interface WaveData {
  height: number; // in feet
  period: number; // in seconds
  direction: number; // in degrees
  quality: WaveQuality;
}

export interface WindData {
  speed: number; // in mph
  direction: number; // in degrees
  gust: number; // in mph
}

export interface TideData {
  height: number; // in feet
  time: Date;
  type: 'high' | 'low';
}

export interface WeatherData {
  temperature: number; // in Fahrenheit
  humidity: number; // percentage
  pressure: number; // in hPa
  visibility: number; // in miles
  uvIndex: number;
}

export interface SurfConditions {
  location: string;
  timestamp: Date;
  waves: WaveData;
  wind: WindData;
  tide: TideData;
  weather: WeatherData;
  rating: SurfRating;
  recommendations: string[];
}

export type WaveQuality = 'poor' | 'fair' | 'good' | 'excellent';

export type SurfRating = 1 | 2 | 3 | 4 | 5;

export interface SurfSpot {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  breakType: BreakType;
  difficulty: DifficultyLevel;
  bestConditions: {
    windDirection: number[];
    swellDirection: number[];
    tideRange: [number, number];
  };
}

export type BreakType = 
  | 'beach_break' 
  | 'reef_break' 
  | 'point_break' 
  | 'river_mouth' 
  | 'jetty';

export type DifficultyLevel = 
  | 'beginner' 
  | 'intermediate' 
  | 'advanced' 
  | 'expert';

export interface SurfForecast {
  spot: SurfSpot;
  conditions: SurfConditions[];
  forecastPeriod: {
    start: Date;
    end: Date;
  };
}

export interface SurfRecommendation {
  spot: SurfSpot;
  bestTime: Date;
  rating: SurfRating;
  reason: string;
  conditions: SurfConditions;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}
