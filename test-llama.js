#!/usr/bin/env node

/**
 * Test script for Llama integration
 * Run with: node test-llama.js
 */

const { LlamaService } = require('./dist/services/llamaService');

async function testLlama() {
  console.log('🧪 Testing Llama Integration...\n');
  
  try {
    // Initialize Llama service
    const llamaService = new LlamaService('http://localhost:11434', 'llama3.2');
    
    // Check if Ollama is available
    console.log('1. Checking Ollama availability...');
    const isAvailable = await llamaService.isAvailable();
    console.log(`   Ollama Available: ${isAvailable ? '✅' : '❌'}`);
    
    if (!isAvailable) {
      console.log('\n❌ Ollama is not running. Please start it with: ollama serve');
      console.log('   Then pull a model: ollama pull llama3.2');
      process.exit(1);
    }
    
    // List available models
    console.log('\n2. Checking available models...');
    const models = await llamaService.getAvailableModels();
    console.log(`   Available Models: ${models.length > 0 ? models.join(', ') : 'None'}`);
    
    if (models.length === 0) {
      console.log('\n❌ No models found. Please pull a model: ollama pull llama3.2');
      process.exit(1);
    }
    
    // Test a simple chat
    console.log('\n3. Testing simple chat...');
    const testResponse = await llamaService.ollama.chat({
      model: 'llama3.2',
      messages: [
        {
          role: 'user',
          content: 'Hello! Can you help me analyze surf conditions?'
        }
      ],
      options: {
        temperature: 0.7,
        num_predict: 100,
      }
    });
    
    console.log('   Response:', testResponse.message.content.substring(0, 100) + '...');
    console.log('   ✅ Llama integration working!');
    
    console.log('\n🎉 All tests passed! Llama is ready to use.');
    
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
testLlama();
