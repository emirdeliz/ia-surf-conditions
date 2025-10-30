import { Ollama } from 'ollama';
import { SurfConditions, SurfSpot, WindData, WeatherData } from '../types/surf';

/**
 * Llama Service for AI-powered surf analysis using local Llama model
 */
export class LlamaService {
  public ollama: Ollama;
  private model: string;

  constructor(baseUrl: string = 'http://localhost:11434', model: string = 'llama3.2') {
    this.ollama = new Ollama({ host: baseUrl });
    this.model = model;
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
    const prompt = this.buildSurfAnalysisPrompt(conditions, spot, historicalData);

    try {
      const response = await this.ollama.chat({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `You are an expert surf analyst and oceanographer with 20+ years of experience. 
            You specialize in analyzing surf conditions, wave forecasting, and providing personalized 
            recommendations for surfers of all skill levels. You understand the nuances of different 
            surf breaks, weather patterns, and how they affect surf quality.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        options: {
          temperature: 0.7,
          num_predict: 1000,
        }
      });

      const content = response.message.content || '';
      return this.parseLLMResponse(content);
    } catch (error) {
      throw new Error(`Llama analysis failed: ${error}`);
    }
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
    const prompt = this.buildForecastPrompt(spot, weatherData, windData, historicalConditions);

    try {
      const response = await this.ollama.chat({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `You are a professional surf forecaster with expertise in meteorology, 
            oceanography, and surf science. You can predict surf conditions days in advance 
            by analyzing weather patterns, swell models, and historical data.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        options: {
          temperature: 0.6,
          num_predict: 1200,
        }
      });

      const content = response.message.content || '';
      return this.parseForecastResponse(content);
    } catch (error) {
      throw new Error(`Forecast generation failed: ${error}`);
    }
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
    const prompt = this.buildPersonalizedPrompt(spot, conditions, userProfile);

    try {
      const response = await this.ollama.chat({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `You are a personal surf coach and safety expert. You provide tailored 
            advice based on individual skill levels, preferences, and current conditions. 
            You prioritize safety while helping surfers improve their experience.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        options: {
          temperature: 0.8,
          num_predict: 800,
        }
      });

      const content = response.message.content || '';
      return this.parsePersonalizedResponse(content);
    } catch (error) {
      throw new Error(`Personalized recommendations failed: ${error}`);
    }
  }

  /**
   * Build surf analysis prompt
   */
  private buildSurfAnalysisPrompt(
    conditions: SurfConditions,
    spot: SurfSpot,
    historicalData?: SurfConditions[]
  ): string {
    const historicalContext = historicalData 
      ? `\nHistorical Data (last ${historicalData.length} days):\n${historicalData.map(d => 
          `- ${d.timestamp.toLocaleDateString()}: ${d.waves.height}ft, ${d.wind.speed}mph wind, rating: ${d.rating}/5`
        ).join('\n')}`
      : '';

    return `
Analyze the following surf conditions and provide detailed insights:

SURF SPOT: ${spot.name}
- Location: ${spot.location.address}
- Break Type: ${spot.breakType}
- Difficulty: ${spot.difficulty}

CURRENT CONDITIONS:
- Wave Height: ${conditions.waves.height}ft
- Wave Period: ${conditions.waves.period}s
- Wave Direction: ${conditions.waves.direction}°
- Wave Quality: ${conditions.waves.quality}
- Wind Speed: ${conditions.wind.speed}mph
- Wind Direction: ${conditions.wind.direction}°
- Wind Gusts: ${conditions.wind.gust}mph
- Temperature: ${conditions.weather.temperature}°F
- Humidity: ${conditions.weather.humidity}%
- Tide Height: ${conditions.tide.height}ft
- Tide Type: ${conditions.tide.type}
- Current Rating: ${conditions.rating}/5

${historicalContext}

Please provide:
1. Detailed analysis of current conditions
2. Specific recommendations for surfers
3. Safety considerations
4. Best time to surf today
5. Confidence level (1-10) in your assessment

Format your response as JSON with keys: analysis, recommendations (array), confidence (number), bestTime (string).
    `.trim();
  }

  /**
   * Build forecast prompt
   */
  private buildForecastPrompt(
    spot: SurfSpot,
    weatherData: WeatherData[],
    windData: WindData[],
    historicalConditions: SurfConditions[]
  ): string {
    return `
Generate a 5-day surf forecast for ${spot.name} (${spot.location.address}).

WEATHER FORECAST:
${weatherData.map((w, i) => 
  `Day ${i + 1}: ${w.temperature}°F, ${w.humidity}% humidity, ${w.pressure}hPa pressure`
).join('\n')}

WIND FORECAST:
${windData.map((w, i) => 
  `Day ${i + 1}: ${w.speed}mph from ${w.direction}°, gusts to ${w.gust}mph`
).join('\n')}

HISTORICAL PATTERNS:
${historicalConditions.map(h => 
  `- ${h.timestamp.toLocaleDateString()}: ${h.waves.height}ft waves, ${h.rating}/5 rating`
).join('\n')}

SPOT CHARACTERISTICS:
- Break Type: ${spot.breakType}
- Difficulty: ${spot.difficulty}
- Best Conditions: Wind ${spot.bestConditions.windDirection.join('-')}°, 
  Swell ${spot.bestConditions.swellDirection.join('-')}°, 
  Tide ${spot.bestConditions.tideRange[0]}-${spot.bestConditions.tideRange[1]}ft

Provide:
1. Overall forecast summary
2. Best days to surf (top 3)
3. Any warnings or concerns
4. Specific recommendations for each day

Format as JSON with keys: forecast, bestDays (array with date, rating, conditions), warnings (array).
    `.trim();
  }

  /**
   * Build personalized prompt
   */
  private buildPersonalizedPrompt(
    spot: SurfSpot,
    conditions: SurfConditions,
    userProfile: any
  ): string {
    return `
Provide personalized surf recommendations for this user:

USER PROFILE:
- Skill Level: ${userProfile.skillLevel}
- Preferences: ${userProfile.preferences.join(', ')}
- Goals: ${userProfile.goals.join(', ')}

CURRENT CONDITIONS:
- Wave Height: ${conditions.waves.height}ft
- Wave Quality: ${conditions.waves.quality}
- Wind: ${conditions.wind.speed}mph from ${conditions.wind.direction}°
- Rating: ${conditions.rating}/5

SPOT: ${spot.name} (${spot.difficulty} difficulty)

Provide:
1. Personalized recommendations
2. Safety advice specific to their skill level
3. Equipment suggestions
4. Alternative spots if current conditions aren't ideal

Format as JSON with keys: recommendations, safetyAdvice, equipmentSuggestions, alternativeSpots.
    `.trim();
  }

  /**
   * Parse LLM response for surf analysis
   */
  private parseLLMResponse(content: string): any {
    try {
      // Try to extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback parsing
      return {
        analysis: content,
        recommendations: [content],
        confidence: 7,
        bestTime: 'Morning (6-10 AM)'
      };
    } catch (error) {
      return {
        analysis: content,
        recommendations: [content],
        confidence: 5,
        bestTime: 'Morning (6-10 AM)'
      };
    }
  }

  /**
   * Parse forecast response
   */
  private parseForecastResponse(content: string): any {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {
        forecast: content,
        bestDays: [],
        warnings: []
      };
    } catch (error) {
      return {
        forecast: content,
        bestDays: [],
        warnings: []
      };
    }
  }

  /**
   * Parse personalized response
   */
  private parsePersonalizedResponse(content: string): any {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {
        recommendations: [content],
        safetyAdvice: ['Always check conditions before surfing'],
        equipmentSuggestions: ['Appropriate wetsuit for water temperature'],
        alternativeSpots: []
      };
    } catch (error) {
      return {
        recommendations: [content],
        safetyAdvice: ['Always check conditions before surfing'],
        equipmentSuggestions: ['Appropriate wetsuit for water temperature'],
        alternativeSpots: []
      };
    }
  }

  /**
   * Check if Llama service is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      await this.ollama.list();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get available models
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await this.ollama.list();
      return response.models.map(model => model.name);
    } catch (error) {
      return [];
    }
  }
}
