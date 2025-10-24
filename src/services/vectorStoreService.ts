// Note: Pinecone client import would be added when implementing
import { MongoClient, Db, Collection } from 'mongodb';
import { SurfConditions, SurfSpot } from '../types/surf';

/**
 * Vector Store Service for managing embeddings with Pinecone and MongoDB
 */
export class VectorStoreService {
  private pinecone: any; // Mock Pinecone for now
  private mongoClient: MongoClient;
  private db: Db;
  private surfCollection: Collection;

  constructor(
    _pineconeApiKey: string,
    _pineconeEnvironment: string,
    mongoUri: string,
    dbName: string = 'surf_conditions'
  ) {
    // Initialize Pinecone (mock for now)
    this.pinecone = {
      query: async () => ({ matches: [] }),
      upsert: async () => ({})
    };

    // Initialize MongoDB
    this.mongoClient = new MongoClient(mongoUri);
    this.db = this.mongoClient.db(dbName);
    this.surfCollection = this.db.collection('surf_conditions');
  }

  /**
   * Connect to databases
   */
  async connect(): Promise<void> {
    try {
      await this.mongoClient.connect();
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      throw new Error(`MongoDB connection failed: ${error}`);
    }
  }

  /**
   * Disconnect from databases
   */
  async disconnect(): Promise<void> {
    try {
      await this.mongoClient.close();
      console.log('✅ Disconnected from MongoDB');
    } catch (error) {
      console.error('❌ MongoDB disconnect error:', error);
    }
  }

  /**
   * Store surf analysis with embeddings
   */
  async storeSurfAnalysis(data: {
    spot: SurfSpot;
    conditions: SurfConditions;
    analysis: any;
    timestamp: Date;
  }): Promise<void> {
    try {
      // Create embedding from surf data
      const embedding = await this.createSurfEmbedding(data);
      
      // Store in Pinecone
      await this.storeInPinecone({
        id: `${data.spot.id}_${data.timestamp.getTime()}`,
        embedding,
        metadata: {
          spotId: data.spot.id,
          spotName: data.spot.name,
          timestamp: data.timestamp.toISOString(),
          waveHeight: data.conditions.waves.height,
          wavePeriod: data.conditions.waves.period,
          windSpeed: data.conditions.wind.speed,
          rating: data.conditions.rating,
          breakType: data.spot.breakType,
          difficulty: data.spot.difficulty
        }
      });

      console.log('✅ Stored surf analysis in vector database');
    } catch (error) {
      throw new Error(`Vector storage failed: ${error}`);
    }
  }

  /**
   * Store in MongoDB
   */
  async storeInMongoDB(data: {
    spotId: string;
    conditions: SurfConditions;
    analysis: any;
    timestamp: Date;
  }): Promise<void> {
    try {
      const document = {
        spotId: data.spotId,
        conditions: data.conditions,
        analysis: data.analysis,
        timestamp: data.timestamp,
        createdAt: new Date()
      };

      await this.surfCollection.insertOne(document);
      console.log('✅ Stored surf data in MongoDB');
    } catch (error) {
      throw new Error(`MongoDB storage failed: ${error}`);
    }
  }

  /**
   * Get historical conditions for a spot
   */
  async getHistoricalConditions(spotId: string, days: number = 7): Promise<SurfConditions[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const historicalData = await this.surfCollection
        .find({
          spotId,
          timestamp: { $gte: startDate }
        })
        .sort({ timestamp: -1 })
        .toArray();

      return historicalData.map(doc => doc['conditions']);
    } catch (error) {
      throw new Error(`Historical data retrieval failed: ${error}`);
    }
  }

  /**
   * Search similar surf conditions
   */
  async searchSimilarConditions(
    spot: SurfSpot,
    conditions: SurfConditions,
    limit: number = 5
  ): Promise<Array<{
    conditions: SurfConditions;
    similarity: number;
    metadata: any;
  }>> {
    try {
      // Create embedding for current conditions
      const embedding = await this.createSurfEmbedding({
        spot,
        conditions,
        analysis: null,
        timestamp: new Date()
      });

      // Search in Pinecone
      const searchResults = await this.pinecone.query({
        vector: embedding,
        topK: limit,
        includeMetadata: true,
        filter: {
          breakType: spot.breakType,
          difficulty: spot.difficulty
        }
      });

      return searchResults.matches?.map((match: any) => ({
        conditions: match['metadata'] as SurfConditions,
        similarity: match.score || 0,
        metadata: match['metadata']
      })) || [];
    } catch (error) {
      throw new Error(`Similar conditions search failed: ${error}`);
    }
  }

  /**
   * Get surf recommendations based on similar conditions
   */
  async getSurfRecommendations(
    spot: SurfSpot,
    userPreferences: {
      skillLevel: string;
      preferredWaveHeight: [number, number];
      preferredWindSpeed: [number, number];
    }
  ): Promise<Array<{
    spot: SurfSpot;
    conditions: SurfConditions;
    matchScore: number;
    recommendation: string;
  }>> {
    try {
      // Search for similar conditions
      const similarConditions = await this.searchSimilarConditions(spot, {
        location: spot.name,
        timestamp: new Date(),
        waves: { height: 0, period: 0, direction: 0, quality: 'fair' },
        wind: { speed: 0, direction: 0, gust: 0 },
        tide: { height: 0, time: new Date(), type: 'high' },
        weather: { temperature: 0, humidity: 0, pressure: 0, visibility: 0, uvIndex: 0 },
        rating: 3,
        recommendations: []
      });

      // Filter and score based on user preferences
      const recommendations = similarConditions
        .filter(result => {
          const conditions = result.conditions;
          return (
            conditions.waves.height >= userPreferences.preferredWaveHeight[0] &&
            conditions.waves.height <= userPreferences.preferredWaveHeight[1] &&
            conditions.wind.speed >= userPreferences.preferredWindSpeed[0] &&
            conditions.wind.speed <= userPreferences.preferredWindSpeed[1]
          );
        })
        .map(result => ({
          spot,
          conditions: result.conditions,
          matchScore: result.similarity,
          recommendation: this.generateRecommendation(result.conditions, userPreferences.skillLevel)
        }))
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5);

      return recommendations;
    } catch (error) {
      throw new Error(`Recommendations generation failed: ${error}`);
    }
  }

  /**
   * Create embedding from surf data
   */
  private async createSurfEmbedding(data: {
    spot: SurfSpot;
    conditions: SurfConditions;
    analysis: any;
    timestamp: Date;
  }): Promise<number[]> {
    // Create a text representation of the surf data
    const textData = `
      Spot: ${data.spot.name}
      Break Type: ${data.spot.breakType}
      Difficulty: ${data.spot.difficulty}
      Wave Height: ${data.conditions.waves.height}ft
      Wave Period: ${data.conditions.waves.period}s
      Wave Direction: ${data.conditions.waves.direction}°
      Wave Quality: ${data.conditions.waves.quality}
      Wind Speed: ${data.conditions.wind.speed}mph
      Wind Direction: ${data.conditions.wind.direction}°
      Temperature: ${data.conditions.weather.temperature}°F
      Humidity: ${data.conditions.weather.humidity}%
      Tide Height: ${data.conditions.tide.height}ft
      Rating: ${data.conditions.rating}/5
    `;

    // In a real implementation, you would use an embedding model like OpenAI's text-embedding-ada-002
    // For now, we'll create a simple numerical representation
    return this.createSimpleEmbedding(textData);
  }

  /**
   * Create simple embedding (placeholder for real embedding model)
   */
  private createSimpleEmbedding(text: string): number[] {
    // This is a simplified embedding - in production, use a proper embedding model
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(384).fill(0); // Standard embedding size
    
    words.forEach(word => {
      const hash = this.simpleHash(word);
      const index = hash % 384;
      embedding[index] += 1;
    });

    // Normalize the embedding
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / magnitude);
  }

  /**
   * Simple hash function for embedding
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Store embedding in Pinecone
   */
  private async storeInPinecone(data: {
    id: string;
    embedding: number[];
    metadata: any;
  }): Promise<void> {
    try {
      await this.pinecone.upsert({
        vectors: [{
          id: data.id,
          values: data.embedding,
          metadata: data.metadata
        }]
      });
    } catch (error) {
      throw new Error(`Pinecone storage failed: ${error}`);
    }
  }

  /**
   * Generate recommendation based on conditions
   */
  private generateRecommendation(conditions: SurfConditions, skillLevel: string): string {
    if (conditions.rating >= 4) {
      return `Excellent conditions! Perfect for ${skillLevel} surfers.`;
    } else if (conditions.rating >= 3) {
      return `Good conditions for ${skillLevel} surfers.`;
    } else if (conditions.rating >= 2) {
      return `Fair conditions. Suitable for ${skillLevel} surfers with experience.`;
    } else {
      return `Challenging conditions. Recommended for advanced surfers only.`;
    }
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats(): Promise<{
    mongoCount: number;
    pineconeStats: any;
  }> {
    try {
      const mongoCount = await this.surfCollection.countDocuments();
      
      return {
        mongoCount,
        pineconeStats: { message: 'Pinecone stats not available in this implementation' }
      };
    } catch (error) {
      throw new Error(`Database stats retrieval failed: ${error}`);
    }
  }
}
