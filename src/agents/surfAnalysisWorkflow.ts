import { LLMService } from '../services/llmService';
import { WeatherService } from '../services/weatherService';
import { SurfService } from '../services/surfService';
import { RAGService } from '../services/ragService';
import { VectorStoreService } from '../services/vectorStoreService';
import { SurfConditions, SurfSpot } from '../types/surf';

/**
 * Simplified workflow for AI-powered surf analysis
 */

// Define the state interface for our workflow
interface SurfAnalysisState {
  spot: SurfSpot;
  currentConditions?: SurfConditions;
  weatherData?: any;
  windData?: any;
  tideData?: any;
  ragContext?: string;
  llmAnalysis?: any;
  recommendations?: string[];
  confidence?: number;
  bestTime?: string;
  errors?: string[];
  completed?: boolean;
}


/**
 * Surf Analysis Workflow - Simplified Implementation
 */
export class SurfAnalysisWorkflow {
  private llmService: LLMService;
  private weatherService: WeatherService;
  private surfService: SurfService;
  private ragService: RAGService;
  private vectorStoreService: VectorStoreService;

  constructor(
    llmService: LLMService,
    weatherService: WeatherService,
    surfService: SurfService,
    ragService: RAGService,
    vectorStoreService: VectorStoreService
  ) {
    this.llmService = llmService;
    this.weatherService = weatherService;
    this.surfService = surfService;
    this.ragService = ragService;
    this.vectorStoreService = vectorStoreService;
  }

  /**
   * Fetch weather data agent
   */
  private async fetchWeatherData(state: SurfAnalysisState): Promise<Partial<SurfAnalysisState>> {
    try {
      console.log('🌤️ Fetching weather data...');
      
      const [weather, wind, tide] = await Promise.all([
        this.weatherService.getCurrentWeather(
          state.spot.location.latitude, 
          state.spot.location.longitude
        ),
        this.weatherService.getWindData(
          state.spot.location.latitude, 
          state.spot.location.longitude
        ),
        this.weatherService.getTideData(
          state.spot.location.latitude, 
          state.spot.location.longitude
        )
      ]);

      return {
        weatherData: weather,
        windData: wind,
        tideData: tide
      };
    } catch (error) {
      return {
        errors: [`Weather data fetch failed: ${error}`]
      };
    }
  }

  /**
   * Fetch RAG context agent
   */
  private async fetchRAGContext(state: SurfAnalysisState): Promise<Partial<SurfAnalysisState>> {
    try {
      console.log('🔍 Fetching RAG context...');
      
      // Query RAG system for relevant surf knowledge
      const ragContext = await this.ragService.querySurfKnowledge(
        state.spot.name,
        state.spot.breakType,
        state.spot.difficulty
      );

      return {
        ragContext
      };
    } catch (error) {
      return {
        errors: [`RAG context fetch failed: ${error}`]
      };
    }
  }

  /**
   * Analyze conditions agent
   */
  private async analyzeConditions(state: SurfAnalysisState): Promise<Partial<SurfAnalysisState>> {
    try {
      console.log('📊 Analyzing surf conditions...');
      
      const conditions = await this.surfService.analyzeSurfConditions(state.spot);
      
      return {
        currentConditions: conditions
      };
    } catch (error) {
      return {
        errors: [`Conditions analysis failed: ${error}`]
      };
    }
  }

  /**
   * Generate LLM analysis agent
   */
  private async generateLLMAnalysis(state: SurfAnalysisState): Promise<Partial<SurfAnalysisState>> {
    try {
      console.log('🤖 Generating AI analysis...');
      
      if (!state.currentConditions) {
        throw new Error('No current conditions available');
      }

      // Get historical data from vector store
      const historicalData = await this.vectorStoreService.getHistoricalConditions(
        state.spot.id,
        7 // last 7 days
      );

      const llmAnalysis = await this.llmService.analyzeSurfConditions(
        state.currentConditions,
        state.spot,
        historicalData
      );

      return {
        llmAnalysis,
        recommendations: llmAnalysis.recommendations,
        confidence: llmAnalysis.confidence,
        bestTime: llmAnalysis.bestTime
      };
    } catch (error) {
      return {
        errors: [`LLM analysis failed: ${error}`]
      };
    }
  }

  /**
   * Store results agent
   */
  private async storeResults(state: SurfAnalysisState): Promise<Partial<SurfAnalysisState>> {
    try {
      console.log('💾 Storing results...');
      
      if (state.currentConditions && state.llmAnalysis) {
        // Store in vector database
        await this.vectorStoreService.storeSurfAnalysis({
          spot: state.spot,
          conditions: state.currentConditions,
          analysis: state.llmAnalysis,
          timestamp: new Date()
        });

        // Store in MongoDB
        await this.vectorStoreService.storeInMongoDB({
          spotId: state.spot.id,
          conditions: state.currentConditions,
          analysis: state.llmAnalysis,
          timestamp: new Date()
        });
      }

      return {
        completed: true
      };
    } catch (error) {
      return {
        errors: [`Results storage failed: ${error}`]
      };
    }
  }


  /**
   * Run the complete surf analysis workflow
   */
  async runAnalysis(spot: SurfSpot): Promise<SurfAnalysisState> {
    console.log('🏄‍♂️ Starting AI-powered surf analysis workflow...');
    
    const state: SurfAnalysisState = {
      spot,
      completed: false
    };

    try {
      // Step 1: Fetch weather data
      console.log('🌤️ Step 1: Fetching weather data...');
      const weatherResult = await this.fetchWeatherData(state);
      if (weatherResult.errors) {
        return { ...state, ...weatherResult };
      }
      Object.assign(state, weatherResult);

      // Step 2: Fetch RAG context
      console.log('🔍 Step 2: Fetching RAG context...');
      const ragResult = await this.fetchRAGContext(state);
      if (ragResult.errors) {
        return { ...state, ...ragResult };
      }
      Object.assign(state, ragResult);

      // Step 3: Analyze conditions
      console.log('📊 Step 3: Analyzing conditions...');
      const analysisResult = await this.analyzeConditions(state);
      if (analysisResult.errors) {
        return { ...state, ...analysisResult };
      }
      Object.assign(state, analysisResult);

      // Step 4: Generate LLM analysis
      console.log('🤖 Step 4: Generating LLM analysis...');
      const llmResult = await this.generateLLMAnalysis(state);
      if (llmResult.errors) {
        return { ...state, ...llmResult };
      }
      Object.assign(state, llmResult);

      // Step 5: Store results
      console.log('💾 Step 5: Storing results...');
      const storeResult = await this.storeResults(state);
      if (storeResult.errors) {
        return { ...state, ...storeResult };
      }
      Object.assign(state, storeResult);

      state.completed = true;
      console.log('✅ Workflow completed successfully');
      return state;
    } catch (error) {
      console.error('❌ Workflow failed:', error);
      return {
        ...state,
        errors: [`Workflow execution failed: ${error}`],
        completed: false
      };
    }
  }

  /**
   * Get workflow status
   */
  getWorkflowStatus(): any {
    return {
      status: 'simplified_workflow',
      steps: [
        'fetch_weather_data',
        'fetch_rag_context', 
        'analyze_conditions',
        'generate_llm_analysis',
        'store_results'
      ],
      active: true
    };
  }
}
