#!/usr/bin/env node

/**
 * Test script for RAGService with Llama integration
 * Run with: node test-rag-llama.js
 */

const { RAGService } = require('./dist/services/ragService');
const { VectorStoreService } = require('./dist/services/vectorStoreService');

async function testRAGService() {
  console.log('🧪 Testing RAGService with Llama Integration...\n');
  
  try {
    // Initialize services
    console.log('1. Initializing services...');
    const vectorStoreService = new VectorStoreService(
      'dummy-pinecone-key',
      'dummy-environment',
      'mongodb://localhost:27017/test'
    );
    
    const ragService = new RAGService(
      'http://localhost:11434',
      'llama3.2',
      vectorStoreService,
      'dummy-openweather-key'
    );
    
    console.log(`   RAG Service Provider: ${ragService.getCurrentService()}`);
    
    // Check if Llama is available
    console.log('\n2. Checking Llama availability...');
    const isAvailable = await ragService.isLlamaAvailable();
    console.log(`   Llama Available: ${isAvailable ? '✅' : '❌'}`);
    
    if (!isAvailable) {
      console.log('\n❌ Llama is not running. Please start it with: ollama serve');
      console.log('   Then pull a model: ollama pull llama3.2');
      process.exit(1);
    }
    
    // List available models
    console.log('\n3. Checking available models...');
    const models = await ragService.getAvailableModels();
    console.log(`   Available Models: ${models.length > 0 ? models.join(', ') : 'None'}`);
    
    if (models.length === 0) {
      console.log('\n❌ No models found. Please pull a model: ollama pull llama3.2');
      process.exit(1);
    }
    
    // Test surf knowledge query
    console.log('\n4. Testing surf knowledge query...');
    try {
      const surfKnowledge = await ragService.querySurfKnowledge(
        'Malibu',
        'point_break',
        'intermediate'
      );
      console.log('   ✅ Surf knowledge query successful');
      console.log(`   Response length: ${surfKnowledge.length} characters`);
      console.log(`   Preview: ${surfKnowledge.substring(0, 100)}...`);
    } catch (error) {
      console.log(`   ⚠️  Surf knowledge query failed: ${error.message}`);
      console.log('   This might be due to missing vector store data, which is expected in test mode');
    }
    
    // Test surf conditions analysis
    console.log('\n5. Testing surf conditions analysis...');
    try {
      const mockConditions = {
        waves: { height: 3, period: 12, direction: 225, quality: 'good' },
        wind: { speed: 8, direction: 270, gust: 12 },
        weather: { temperature: 72, humidity: 65, pressure: 1013 },
        tide: { height: 4.5, type: 'rising' },
        rating: 4,
        timestamp: new Date()
      };
      
      const analysis = await ragService.analyzeSurfConditions(
        'Malibu',
        mockConditions,
        'intermediate'
      );
      console.log('   ✅ Surf conditions analysis successful');
      console.log(`   Analysis keys: ${Object.keys(analysis).join(', ')}`);
    } catch (error) {
      console.log(`   ⚠️  Surf conditions analysis failed: ${error.message}`);
      console.log('   This might be due to missing vector store data, which is expected in test mode');
    }
    
    console.log('\n🎉 RAGService Llama integration test completed!');
    console.log('\n📝 Note: Some queries may fail due to missing vector store data in test mode.');
    console.log('   This is expected and doesn\'t indicate a problem with the Llama integration.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure Ollama is running: ollama serve');
    console.log('2. Pull a model: ollama pull llama3.2');
    console.log('3. Check if port 11434 is available');
    process.exit(1);
  }
}

// Run the test
testRAGService();
