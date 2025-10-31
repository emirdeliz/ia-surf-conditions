# Llama Local Setup

This project uses exclusively local Llama through Ollama, allowing surf analysis without depending on external APIs.

## Ollama Installation

1. **Install Ollama:**
   ```bash
   # macOS
   brew install ollama
   
   # Or download from: https://ollama.ai/
   ```

2. **Start the Ollama service:**
   ```bash
   ollama serve
   ```

3. **Download a Llama model:**
   ```bash
   # Recommended model (smaller and faster)
   ollama pull llama3.2
   
   # Or larger models for better quality
   ollama pull llama3.1
   ollama pull llama3.1:70b
   ```

## Project Configuration

1. **Copy the configuration file:**
   ```bash
   cp env.example .env
   ```

2. **Configure environment variables in `.env`:**
   ```env
   # Llama Configuration
   LLAMA_BASE_URL=http://localhost:11434
   LLAMA_MODEL=llama3.2
   
   # Your other configurations...
   OPENWEATHER_API_KEY=your_key_here
   ```

## Usage

1. **Install dependencies:**
   ```bash
   yarn install
   ```

2. **Run the project:**
   ```bash
   yarn dev
   ```

3. **Test the integration:**
   ```bash
   # Basic Llama test
   node test-llama.js
   
   # RAGService test with Llama
   node test-rag-llama.js
   ```

The system will:
- Check if Ollama is running
- List available models
- Use Llama for surf analysis
- Use Llama for RAG (Retrieval-Augmented Generation)

## Services That Use Llama

The following services use exclusively local Llama:

- **LLMService**: Surf condition analysis, forecasts, and personalized recommendations
- **RAGService**: Surf knowledge generation using RAG (Retrieval-Augmented Generation)
- **SurfAnalysisWorkflow**: Complete surf analysis workflow

The project has been simplified to use only Llama, removing the complexity of multiple providers.

## Recommended Llama Models

- **llama3.2** - Fastest, good for development
- **llama3.1** - Better quality, slower
- **llama3.1:70b** - Best quality, requires more RAM

## Troubleshooting

### Ollama is not running
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Start Ollama if necessary
ollama serve
```

### Model not found
```bash
# List available models
ollama list

# Download the required model
ollama pull llama3.2
```

### Connection error
- Verify that port 11434 is available
- Confirm that Ollama is running
- Check if the model was downloaded correctly
