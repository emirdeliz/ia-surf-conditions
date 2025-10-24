import dotenv from 'dotenv';
import { WeatherService } from './services/weatherService';
import { SurfService } from './services/surfService';
import { LLMService } from './services/llmService';
import { RAGService } from './services/ragService';
import { VectorStoreService } from './services/vectorStoreService';
import { SurfAnalysisWorkflow } from './agents/surfAnalysisWorkflow';
import { SurfSpot } from './types/surf';

// Load environment variables
dotenv.config();

/**
 * Main application class for IA Surf Conditions with AI-powered analysis
 */
class SurfConditionsApp {
  private weatherService: WeatherService;
  private surfService: SurfService;
  private llmService: LLMService;
  private ragService: RAGService;
  private vectorStoreService: VectorStoreService;
  private surfAnalysisWorkflow: SurfAnalysisWorkflow;

  constructor() {
    // Initialize services with environment variables
    const openWeatherApiKey = process.env['OPENWEATHER_API_KEY'] || 'your-openweather-api-key';
    const openaiApiKey = process.env['OPENAI_API_KEY'] || 'your-openai-api-key';
    const pineconeApiKey = process.env['PINECONE_API_KEY'] || 'your-pinecone-api-key';
    const pineconeEnvironment = process.env['PINECONE_ENVIRONMENT'] || 'your-pinecone-environment';
    const mongoUri = process.env['MONGODB_URI'] || 'mongodb://localhost:27017';
    
    // Initialize services
    this.weatherService = new WeatherService(openWeatherApiKey);
    this.surfService = new SurfService(this.weatherService);
    this.llmService = new LLMService(openaiApiKey);
    this.vectorStoreService = new VectorStoreService(
      pineconeApiKey,
      pineconeEnvironment,
      mongoUri
    );
    this.ragService = new RAGService(
      openaiApiKey,
      this.vectorStoreService,
      openWeatherApiKey
    );
    
    // Initialize LangGraph workflow
    this.surfAnalysisWorkflow = new SurfAnalysisWorkflow(
      this.llmService,
      this.weatherService,
      this.surfService,
      this.ragService,
      this.vectorStoreService
    );
  }

  /**
   * Get AI-powered surf conditions for a specific spot
   */
  async getSurfConditions(spot: SurfSpot): Promise<void> {
    try {
      console.log(`🏄‍♂️ Starting AI-powered surf analysis for ${spot.name}...`);
      
      // Run the complete LangGraph workflow
      const workflowResult = await this.surfAnalysisWorkflow.runAnalysis(spot);
      
      if (workflowResult.errors && workflowResult.errors.length > 0) {
        console.error('❌ Workflow errors:', workflowResult.errors);
        return;
      }
      
      // Display the AI-powered results
      this.displayAISurfConditions(workflowResult);
      
    } catch (error) {
      console.error('❌ Error getting AI surf conditions:', error);
    }
  }

  /**
   * Get personalized surf recommendations
   */
  async getPersonalizedRecommendations(
    spot: SurfSpot,
    userProfile: {
      skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
      preferences: string[];
      goals: string[];
    }
  ): Promise<void> {
    try {
      console.log(`🤖 Generating personalized recommendations for ${spot.name}...`);
      
      // Get current conditions first
      const conditions = await this.surfService.analyzeSurfConditions(spot);
      
      // Generate personalized recommendations using LLM
      const personalizedRecs = await this.llmService.generatePersonalizedRecommendations(
        spot,
        conditions,
        userProfile
      );
      
      this.displayPersonalizedRecommendations(personalizedRecs);
      
    } catch (error) {
      console.error('❌ Error getting personalized recommendations:', error);
    }
  }

  /**
   * Get surf forecast using AI
   */
  async getAISurfForecast(spot: SurfSpot): Promise<void> {
    try {
      console.log(`🔮 Generating AI surf forecast for ${spot.name}...`);
      
      // Get weather forecast
      const weatherForecast = await this.weatherService.getForecast(
        spot.location.latitude,
        spot.location.longitude,
        5
      );
      
      // Get wind forecast (mock for now)
      const windForecast = Array(5).fill(null).map(() => ({
        speed: 10 + Math.random() * 10,
        direction: 270 + Math.random() * 45,
        gust: 15 + Math.random() * 10
      }));
      
      // Get historical data
      const historicalData = await this.vectorStoreService.getHistoricalConditions(
        spot.id,
        30
      );
      
      // Generate AI forecast
      const aiForecast = await this.llmService.generateSurfForecast(
        spot,
        weatherForecast,
        windForecast,
        historicalData
      );
      
      this.displayAIForecast(aiForecast);
      
    } catch (error) {
      console.error('❌ Error getting AI forecast:', error);
    }
  }

  /**
   * Display AI-powered surf conditions
   */
  private displayAISurfConditions(workflowResult: any): void {
    console.log('\n🤖 AI-POWERED SURF ANALYSIS');
    console.log('='.repeat(60));
    
    if (workflowResult.currentConditions) {
      const conditions = workflowResult.currentConditions;
      console.log(`📍 Location: ${conditions.location}`);
      console.log(`🕐 Time: ${conditions.timestamp.toLocaleString()}`);
      console.log(`⭐ AI Rating: ${'★'.repeat(conditions.rating)} (${conditions.rating}/5)`);
      
      console.log('\n🌊 WAVE CONDITIONS');
      console.log(`   Height: ${conditions.waves.height.toFixed(1)} ft`);
      console.log(`   Period: ${conditions.waves.period.toFixed(1)}s`);
      console.log(`   Direction: ${conditions.waves.direction.toFixed(0)}°`);
      console.log(`   Quality: ${conditions.waves.quality.toUpperCase()}`);
      
      console.log('\n💨 WIND CONDITIONS');
      console.log(`   Speed: ${conditions.wind.speed.toFixed(1)} mph`);
      console.log(`   Direction: ${conditions.wind.direction.toFixed(0)}°`);
      console.log(`   Gusts: ${conditions.wind.gust.toFixed(1)} mph`);
      
      console.log('\n🌡️ WEATHER CONDITIONS');
      console.log(`   Temperature: ${conditions.weather.temperature.toFixed(1)}°F`);
      console.log(`   Humidity: ${conditions.weather.humidity}%`);
      console.log(`   Pressure: ${conditions.weather.pressure} hPa`);
      console.log(`   Visibility: ${conditions.weather.visibility.toFixed(1)} miles`);
    }
    
    if (workflowResult.llmAnalysis) {
      console.log('\n🧠 AI ANALYSIS');
      console.log(`   Confidence: ${workflowResult.confidence}/10`);
      console.log(`   Best Time: ${workflowResult.bestTime}`);
      console.log(`   Analysis: ${workflowResult.llmAnalysis.analysis}`);
    }
    
    if (workflowResult.recommendations) {
      console.log('\n💡 AI RECOMMENDATIONS');
      workflowResult.recommendations.forEach((rec: string, index: number) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
  }

  /**
   * Display personalized recommendations
   */
  private displayPersonalizedRecommendations(recs: any): void {
    console.log('\n🎯 PERSONALIZED RECOMMENDATIONS');
    console.log('='.repeat(50));
    
    console.log('\n💡 RECOMMENDATIONS');
    recs.recommendations.forEach((rec: string, index: number) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
    
    console.log('\n⚠️ SAFETY ADVICE');
    recs.safetyAdvice.forEach((advice: string, index: number) => {
      console.log(`   ${index + 1}. ${advice}`);
    });
    
    console.log('\n🏄‍♂️ EQUIPMENT SUGGESTIONS');
    recs.equipmentSuggestions.forEach((equipment: string, index: number) => {
      console.log(`   ${index + 1}. ${equipment}`);
    });
    
    if (recs.alternativeSpots.length > 0) {
      console.log('\n🏖️ ALTERNATIVE SPOTS');
      recs.alternativeSpots.forEach((spot: string, index: number) => {
        console.log(`   ${index + 1}. ${spot}`);
      });
    }
    
    console.log('\n' + '='.repeat(50));
  }

  /**
   * Display AI forecast
   */
  private displayAIForecast(forecast: any): void {
    console.log('\n🔮 AI SURF FORECAST');
    console.log('='.repeat(50));
    
    console.log('\n📊 FORECAST SUMMARY');
    console.log(forecast.forecast);
    
    if (forecast.bestDays && forecast.bestDays.length > 0) {
      console.log('\n⭐ BEST SURF DAYS');
      forecast.bestDays.forEach((day: any, index: number) => {
        console.log(`   ${index + 1}. ${day.date} - Rating: ${day.rating}/5`);
        console.log(`      Conditions: ${day.conditions}`);
      });
    }
    
    if (forecast.warnings && forecast.warnings.length > 0) {
      console.log('\n⚠️ WARNINGS');
      forecast.warnings.forEach((warning: string, index: number) => {
        console.log(`   ${index + 1}. ${warning}`);
      });
    }
    
    console.log('\n' + '='.repeat(50));
  }


  /**
   * Initialize the AI-powered surf analysis system
   */
  async initialize(): Promise<void> {
    try {
      console.log('🔧 Initializing AI-powered surf analysis system...');
      
      // Connect to databases
      await this.vectorStoreService.connect();
      
      console.log('✅ System initialized successfully');
    } catch (error) {
      console.error('❌ System initialization failed:', error);
      throw error;
    }
  }

  /**
   * Run the AI-powered application
   */
  async run(): Promise<void> {
    console.log('🏄‍♂️ IA Surf Conditions - AI-Powered Surf Analysis');
    console.log('🤖 Powered by OpenAI, LangGraph, Pinecone & MongoDB');
    console.log('='.repeat(70));

    // Initialize the system
    await this.initialize();

    // Example surf spots
    const spots: SurfSpot[] = [
      {
        id: 'malibu-1',
        name: 'Malibu Surfrider Beach',
        location: {
          latitude: 34.0369,
          longitude: -118.6774,
          address: 'Malibu, CA'
        },
        breakType: 'point_break',
        difficulty: 'intermediate',
        bestConditions: {
          windDirection: [270, 315], // West to Northwest
          swellDirection: [200, 250], // Southwest to West
          tideRange: [2, 6] // 2-6 feet
        }
      },
      {
        id: 'huntington-1',
        name: 'Huntington Beach Pier',
        location: {
          latitude: 33.6558,
          longitude: -117.9994,
          address: 'Huntington Beach, CA'
        },
        breakType: 'beach_break',
        difficulty: 'beginner',
        bestConditions: {
          windDirection: [270, 315],
          swellDirection: [200, 250],
          tideRange: [1, 5]
        }
      }
    ];

    // Run AI-powered analysis for each spot
    for (const spot of spots) {
      console.log(`\n🏄‍♂️ Analyzing ${spot.name}...`);
      
      // 1. Get AI-powered surf conditions
      await this.getSurfConditions(spot);
      
      // 2. Get personalized recommendations
      await this.getPersonalizedRecommendations(spot, {
        skillLevel: 'intermediate',
        preferences: ['clean waves', 'light winds'],
        goals: ['improve technique', 'have fun']
      });
      
      // 3. Get AI forecast
      await this.getAISurfForecast(spot);
      
      console.log('\n' + '='.repeat(70));
    }

    // Display system statistics
    await this.displaySystemStats();
  }

  /**
   * Display system statistics
   */
  private async displaySystemStats(): Promise<void> {
    try {
      console.log('\n📊 SYSTEM STATISTICS');
      console.log('='.repeat(40));
      
      const stats = await this.vectorStoreService.getDatabaseStats();
      console.log(`📁 MongoDB Records: ${stats.mongoCount}`);
      console.log(`🔍 Pinecone Status: ${stats.pineconeStats.message}`);
      
      console.log('\n🤖 AI CAPABILITIES');
      console.log('   ✅ OpenAI GPT-4 Integration');
      console.log('   ✅ LangGraph Workflow Orchestration');
      console.log('   ✅ RAG Knowledge Retrieval');
      console.log('   ✅ Vector Embeddings (Pinecone)');
      console.log('   ✅ Historical Data Analysis');
      console.log('   ✅ Personalized Recommendations');
      console.log('   ✅ AI-Powered Forecasting');
      
      console.log('\n' + '='.repeat(40));
    } catch (error) {
      console.error('❌ Error getting system stats:', error);
    }
  }
}

// Run the application
async function main(): Promise<void> {
  const app = new SurfConditionsApp();
  await app.run();
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the main function
if (require.main === module) {
  main().catch(console.error);
}

export { SurfConditionsApp };
