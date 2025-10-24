import axios from 'axios';
import { OpenAI } from 'openai';
import { VectorStoreService } from './vectorStoreService';

/**
 * RAG (Retrieval-Augmented Generation) Service for surf knowledge
 */
export class RAGService {
  private openai: OpenAI;
  private vectorStoreService: VectorStoreService;
  private openWeatherApiKey: string;

  constructor(
    openaiApiKey: string,
    vectorStoreService: VectorStoreService,
    openWeatherApiKey: string
  ) {
    this.openai = new OpenAI({ apiKey: openaiApiKey });
    this.vectorStoreService = vectorStoreService;
    this.openWeatherApiKey = openWeatherApiKey;
  }

  /**
   * Query surf knowledge using RAG
   */
  async querySurfKnowledge(
    spotName: string,
    breakType: string,
    difficulty: string
  ): Promise<string> {
    try {
      // 1. Retrieve relevant context from vector store
      const relevantContext = await this.retrieveRelevantContext(
        spotName,
        breakType,
        difficulty
      );

      // 2. Get current weather data from OpenWeatherMap
      const weatherContext = await this.getWeatherContext(spotName);

      // 3. Generate comprehensive surf knowledge
      const surfKnowledge = await this.generateSurfKnowledge(
        spotName,
        breakType,
        difficulty,
        relevantContext,
        weatherContext
      );

      return surfKnowledge;
    } catch (error) {
      throw new Error(`RAG query failed: ${error}`);
    }
  }

  /**
   * Retrieve relevant context from vector store
   */
  private async retrieveRelevantContext(
    spotName: string,
    breakType: string,
    difficulty: string
  ): Promise<string> {
    try {
      // Search for similar surf conditions and knowledge
      const similarConditions = await this.vectorStoreService.searchSimilarConditions(
        {
          id: 'query-spot',
          name: spotName,
          location: { latitude: 0, longitude: 0, address: '' },
          breakType: breakType as any,
          difficulty: difficulty as any,
          bestConditions: {
            windDirection: [0],
            swellDirection: [0],
            tideRange: [0, 0]
          }
        },
        {
          location: spotName,
          timestamp: new Date(),
          waves: { height: 0, period: 0, direction: 0, quality: 'fair' },
          wind: { speed: 0, direction: 0, gust: 0 },
          tide: { height: 0, time: new Date(), type: 'high' },
          weather: { temperature: 0, humidity: 0, pressure: 0, visibility: 0, uvIndex: 0 },
          rating: 3,
          recommendations: []
        },
        5
      );

      // Extract relevant information
      const context = similarConditions.map(result => {
        const conditions = result.conditions;
        return `
          Similar conditions found:
          - Wave Height: ${conditions.waves.height}ft
          - Wave Period: ${conditions.waves.period}s
          - Wind Speed: ${conditions.wind.speed}mph
          - Rating: ${conditions.rating}/5
          - Recommendations: ${conditions.recommendations.join(', ')}
        `;
      }).join('\n');

      return context;
    } catch (error) {
      console.warn('Context retrieval failed, using fallback:', error);
      return 'No historical context available.';
    }
  }

  /**
   * Get weather context from OpenWeatherMap API
   */
  private async getWeatherContext(_spotName: string): Promise<string> {
    try {
      // For demo purposes, using a default location (Malibu)
      // In production, you would geocode the spot name to get coordinates
      const latitude = 34.0369;
      const longitude = -118.6774;

      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather`,
        {
          params: {
            lat: latitude,
            lon: longitude,
            appid: this.openWeatherApiKey,
            units: 'imperial'
          }
        }
      );

      const data = response.data;
      return `
        Current weather conditions:
        - Temperature: ${data.main.temp}°F
        - Humidity: ${data.main.humidity}%
        - Pressure: ${data.main.pressure} hPa
        - Wind Speed: ${data.wind.speed} mph
        - Wind Direction: ${data.wind.deg}°
        - Visibility: ${data.visibility / 1609.34} miles
        - UV Index: ${data.uvi || 'N/A'}
      `;
    } catch (error) {
      console.warn('Weather context retrieval failed:', error);
      return 'Weather data unavailable.';
    }
  }

  /**
   * Generate comprehensive surf knowledge using LLM
   */
  private async generateSurfKnowledge(
    spotName: string,
    breakType: string,
    difficulty: string,
    relevantContext: string,
    weatherContext: string
  ): Promise<string> {
    try {
      const prompt = `
        You are an expert surf analyst. Generate comprehensive surf knowledge for:
        
        SPOT: ${spotName}
        BREAK TYPE: ${breakType}
        DIFFICULTY: ${difficulty}
        
        HISTORICAL CONTEXT:
        ${relevantContext}
        
        CURRENT WEATHER:
        ${weatherContext}
        
        Please provide:
        1. Detailed analysis of this surf spot's characteristics
        2. Best conditions for this break type
        3. Safety considerations for the difficulty level
        4. Equipment recommendations
        5. Best times to surf
        6. What to expect in different conditions
        
        Format your response as a comprehensive surf guide.
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert surf analyst and oceanographer with deep knowledge of surf breaks, weather patterns, and ocean conditions. Provide detailed, accurate, and safety-focused surf analysis.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });

      return response.choices[0]?.message?.content || 'Unable to generate surf knowledge.';
    } catch (error) {
      throw new Error(`Surf knowledge generation failed: ${error}`);
    }
  }

  /**
   * Query specific surf conditions with RAG
   */
  async querySurfConditions(
    _spotName: string,
    conditions: {
      waveHeight: number;
      windSpeed: number;
      temperature: number;
    }
  ): Promise<{
    analysis: string;
    recommendations: string[];
    safetyAdvice: string[];
  }> {
    try {
      // Get relevant historical data
      const historicalData = await this.vectorStoreService.getHistoricalConditions(
        _spotName,
        30 // last 30 days
      );

      // Create context from historical data
      const historicalContext = historicalData
        .filter(data => 
          Math.abs(data.waves.height - conditions.waveHeight) < 2 &&
          Math.abs(data.wind.speed - conditions.windSpeed) < 10
        )
        .slice(0, 5)
        .map(data => `
          Historical similar conditions:
          - Wave Height: ${data.waves.height}ft
          - Wind Speed: ${data.wind.speed}mph
          - Rating: ${data.rating}/5
          - Recommendations: ${data.recommendations.join(', ')}
        `)
        .join('\n');

      // Generate analysis using LLM
      const analysis = await this.generateConditionAnalysis(
        _spotName,
        conditions,
        historicalContext
      );

      return analysis;
    } catch (error) {
      throw new Error(`Surf conditions query failed: ${error}`);
    }
  }

  /**
   * Generate condition analysis using LLM
   */
  private async generateConditionAnalysis(
    spotName: string,
    conditions: any,
    historicalContext: string
  ): Promise<{
    analysis: string;
    recommendations: string[];
    safetyAdvice: string[];
  }> {
    try {
      const prompt = `
        Analyze these surf conditions for ${spotName}:
        
        CURRENT CONDITIONS:
        - Wave Height: ${conditions.waveHeight}ft
        - Wind Speed: ${conditions.windSpeed}mph
        - Temperature: ${conditions.temperature}°F
        
        HISTORICAL CONTEXT:
        ${historicalContext}
        
        Provide:
        1. Detailed analysis of current conditions
        2. Specific recommendations for surfers
        3. Safety advice and warnings
        4. Equipment suggestions
        5. Best time to surf today
        
        Format as JSON with keys: analysis, recommendations (array), safetyAdvice (array).
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a professional surf coach and safety expert. Provide detailed, accurate, and safety-focused surf analysis.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 1000
      });

      const content = response.choices[0]?.message?.content || '';
      
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.warn('JSON parsing failed, using fallback');
      }

      // Fallback response
      return {
        analysis: content,
        recommendations: ['Check conditions before surfing', 'Always surf with a buddy'],
        safetyAdvice: ['Know your limits', 'Check weather and tide conditions']
      };
    } catch (error) {
      throw new Error(`Condition analysis generation failed: ${error}`);
    }
  }

  /**
   * Get surf spot recommendations based on current conditions
   */
  async getSpotRecommendations(
    _userLocation: { latitude: number; longitude: number },
    _preferences: {
      skillLevel: string;
      preferredWaveHeight: [number, number];
      maxDistance: number;
    }
  ): Promise<Array<{
    spot: string;
    distance: number;
    conditions: string;
    recommendation: string;
  }>> {
    try {
      // This would typically involve:
      // 1. Finding nearby surf spots
      // 2. Getting current conditions for each spot
      // 3. Filtering based on user preferences
      // 4. Ranking by suitability

      // For demo purposes, return mock recommendations
      const recommendations = [
        {
          spot: 'Malibu Surfrider Beach',
          distance: 2.5,
          conditions: '3-4ft waves, light winds, clean conditions',
          recommendation: 'Perfect for intermediate surfers'
        },
        {
          spot: 'Huntington Beach Pier',
          distance: 5.2,
          conditions: '2-3ft waves, moderate winds, good for beginners',
          recommendation: 'Great for learning and practice'
        }
      ];

      return recommendations;
    } catch (error) {
      throw new Error(`Spot recommendations failed: ${error}`);
    }
  }
}
