import { LlamaService } from './llamaService';
import { SurfConditions, SurfSpot, WindData, WeatherData } from '../types/surf';

/**
 * LLM Service for AI-powered surf analysis using Llama
 */
export class LLMService {
  private llamaService: LlamaService;

  constructor(baseUrl: string = 'http://localhost:11434', model: string = 'llama3.2') {
    this.llamaService = new LlamaService(baseUrl, model);
  }

  /**
   * Generate AI-powered surf analysis and recommendations
   */
  async analyzeSurfConditions(
    conditions: SurfConditions,
    spot: SurfSpot,
    historicalData?: SurfConditions[]
  ): Promise<{
    analysis: string;
    recommendations: string[];
    confidence: number;
    bestTime: string;
  }> {
    return await this.llamaService.analyzeSurfConditions(conditions, spot, historicalData);
  }

  /**
   * Generate surf forecast using AI
   */
  async generateSurfForecast(
    spot: SurfSpot,
    weatherData: WeatherData[],
    windData: WindData[],
    historicalConditions: SurfConditions[]
  ): Promise<{
    forecast: string;
    bestDays: Array<{
      date: string;
      rating: number;
      conditions: string;
    }>;
    warnings: string[];
  }> {
    return await this.llamaService.generateSurfForecast(spot, weatherData, windData, historicalConditions);
  }

  /**
   * Generate personalized surf recommendations
   */
  async generatePersonalizedRecommendations(
    spot: SurfSpot,
    conditions: SurfConditions,
    userProfile: {
      skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
      preferences: string[];
      goals: string[];
    }
  ): Promise<{
    recommendations: string[];
    safetyAdvice: string[];
    equipmentSuggestions: string[];
    alternativeSpots: string[];
  }> {
    return await this.llamaService.generatePersonalizedRecommendations(spot, conditions, userProfile);
  }


  /**
   * Check if Llama service is available
   */
  async isLlamaAvailable(): Promise<boolean> {
    return await this.llamaService.isAvailable();
  }

  /**
   * Get available Llama models
   */
  async getAvailableModels(): Promise<string[]> {
    return await this.llamaService.getAvailableModels();
  }

  /**
   * Get current service type
   */
  getCurrentService(): 'llama' {
    return 'llama';
  }
}
