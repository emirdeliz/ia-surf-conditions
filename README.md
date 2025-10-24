# 🏄‍♂️ IA Surf Conditions

AI-powered surf conditions checker built with TypeScript, featuring advanced LLM integration, LangGraph orchestration, vector embeddings, and RAG (Retrieval-Augmented Generation) for intelligent surf analysis.

---

# 🏄‍♂️ IA Surf Conditions (Português)

Sistema inteligente de análise de condições de surf construído com TypeScript, apresentando integração avançada de LLM, orquestração LangGraph, embeddings vetoriais e RAG (Retrieval-Augmented Generation) para análise inteligente de surf.

## ✨ Features

### 🤖 AI-Powered Analysis
- **OpenAI GPT-4 Integration** - Advanced language model for surf analysis
- **LangGraph Workflow Orchestration** - Coordinated AI agents for complex analysis
- **RAG (Retrieval-Augmented Generation)** - Context-aware surf knowledge retrieval
- **Vector Embeddings** - Pinecone integration for similarity search
- **Historical Data Analysis** - Learn from past surf conditions

### 🌊 Surf Intelligence
- **Real-time Surf Analysis** - Get current wave, wind, and weather conditions
- **AI-Powered Recommendations** - Personalized surf advice based on conditions
- **Personalized Recommendations** - Tailored advice based on skill level and preferences
- **AI Surf Forecasting** - Multi-day predictions with confidence scores
- **Safety Analysis** - AI-powered safety recommendations

### 🗄️ Data Management
- **MongoDB Integration** - Persistent storage for surf data
- **Pinecone Vector Database** - High-performance vector similarity search
- **OpenWeatherMap API** - Real-time weather and ocean data
- **Historical Context** - Learn from past conditions and patterns

### 🛠️ Technical Features
- **TypeScript Support** - Full type safety and modern development experience
- **Multiple Surf Spots** - Support for various surf breaks and locations
- **Modular Architecture** - Clean separation of concerns
- **Comprehensive Testing** - Unit tests for all components

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- **OpenWeatherMap API key** (free at [openweathermap.org](https://openweathermap.org/api))
- **OpenAI API key** (get at [platform.openai.com](https://platform.openai.com/api-keys))
- **Pinecone account** (free at [app.pinecone.io](https://app.pinecone.io/))
- **MongoDB** (local or MongoDB Atlas)

### Installation

1. **Clone and install dependencies:**
```bash
cd ia-surf-conditions
npm install
```

2. **Set up environment variables:**
```bash
cp env.example .env
# Edit .env and add your API keys:
# - OPENWEATHER_API_KEY
# - OPENAI_API_KEY  
# - PINECONE_API_KEY
# - PINECONE_ENVIRONMENT
# - MONGODB_URI
```

3. **Build the project:**
```bash
npm run build
```

4. **Run the application:**
```bash
npm start
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Run with ts-node
npm run watch        # Watch mode for development
npm run build        # Build TypeScript to JavaScript
npm run start        # Run built application

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix    # Fix ESLint issues
npm test            # Run tests
npm run clean       # Clean build directory
```

### Project Structure

```
ia-surf-conditions/
├── src/
│   ├── types/           # TypeScript type definitions
│   │   └── surf.ts      # Surf-related interfaces
│   ├── services/        # Business logic services
│   │   ├── weatherService.ts
│   │   └── surfService.ts
│   └── index.ts         # Main application entry point
├── dist/               # Compiled JavaScript (generated)
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── jest.config.js      # Testing configuration
└── .eslintrc.json      # ESLint configuration
```

## 🤖 AI Architecture

### LangGraph Workflow
The system uses LangGraph to orchestrate multiple AI agents:

1. **Weather Data Agent** - Fetches real-time weather and ocean data
2. **RAG Context Agent** - Retrieves relevant surf knowledge from vector database
3. **Conditions Analysis Agent** - Analyzes current surf conditions
4. **LLM Analysis Agent** - Generates AI-powered insights and recommendations
5. **Storage Agent** - Saves results to MongoDB and Pinecone

### RAG (Retrieval-Augmented Generation)
- **Knowledge Base**: Historical surf conditions and expert knowledge
- **Vector Search**: Pinecone for similarity-based retrieval
- **Context Enhancement**: OpenWeatherMap API for real-time data
- **LLM Integration**: GPT-4 for intelligent analysis and recommendations

### Data Flow
```
User Request → LangGraph Workflow → Weather API → RAG System → LLM Analysis → Vector Storage → Personalized Response
```

## 📊 API Reference

### Core Types

```typescript
interface SurfConditions {
  location: string;
  timestamp: Date;
  waves: WaveData;
  wind: WindData;
  tide: TideData;
  weather: WeatherData;
  rating: SurfRating;
  recommendations: string[];
}

interface SurfSpot {
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
```

### Services

#### WeatherService
- `getCurrentWeather(lat, lon)` - Get current weather conditions
- `getWindData(lat, lon)` - Get wind speed and direction
- `getTideData(lat, lon)` - Get tide information
- `getForecast(lat, lon, days)` - Get multi-day forecast

#### SurfService
- `analyzeSurfConditions(spot)` - Analyze surf conditions for a spot
- `getBestSurfTimes(spot, days)` - Get optimal surf times

## 🌊 Example Usage

```typescript
import { SurfConditionsApp } from './src/index';

// Create app instance
const app = new SurfConditionsApp();

// Define a surf spot
const malibu = {
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
    windDirection: [270, 315],
    swellDirection: [200, 250],
    tideRange: [2, 6]
  }
};

// Get surf conditions
await app.getSurfConditions(malibu);
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## 📦 Build & Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
CMD ["npm", "start"]
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENWEATHER_API_KEY` | OpenWeatherMap API key | Yes |
| `WEATHER_API_KEY` | Alternative weather API | No |
| `TIDE_API_KEY` | Tide data API key | No |

### TypeScript Configuration

The project uses strict TypeScript configuration with:
- Strict type checking
- No implicit any
- Unused variable detection
- Consistent casing enforcement

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenWeatherMap](https://openweathermap.org/) for weather data
- [NOAA](https://www.noaa.gov/) for ocean data
- TypeScript community for excellent tooling

## 📞 Support

For support, email emirdeliz@gmail.com or create an issue in the repository.

---

## 🇧🇷 Documentação em Português

### ✨ Funcionalidades

#### 🤖 Análise Powered by IA
- **Integração OpenAI GPT-4** - Modelo de linguagem avançado para análise de surf
- **Orquestração LangGraph** - Agentes de IA coordenados para análise complexa
- **RAG (Retrieval-Augmented Generation)** - Recuperação de conhecimento contextual de surf
- **Embeddings Vetoriais** - Integração Pinecone para busca por similaridade
- **Análise de Dados Históricos** - Aprende com condições de surf passadas

#### 🌊 Inteligência de Surf
- **Análise de Surf em Tempo Real** - Obtenha condições atuais de ondas, vento e clima
- **Recomendações Powered by IA** - Conselhos personalizados de surf baseados em condições
- **Recomendações Personalizadas** - Conselhos adaptados baseados no nível de habilidade e preferências
- **Previsão de Surf com IA** - Previsões de múltiplos dias com scores de confiança
- **Análise de Segurança** - Recomendações de segurança powered by IA

#### 🗄️ Gerenciamento de Dados
- **Integração MongoDB** - Armazenamento persistente para dados de surf
- **Banco de Dados Vetorial Pinecone** - Busca de similaridade vetorial de alta performance
- **API OpenWeatherMap** - Dados de clima e oceano em tempo real
- **Contexto Histórico** - Aprende com condições e padrões passados

#### 🛠️ Funcionalidades Técnicas
- **Suporte TypeScript** - Segurança de tipos completa e experiência de desenvolvimento moderna
- **Múltiplos Spots de Surf** - Suporte para várias quebras de surf e localizações
- **Arquitetura Modular** - Separação limpa de responsabilidades
- **Testes Abrangentes** - Testes unitários para todos os componentes

### 🚀 Início Rápido

#### Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- **Chave API OpenWeatherMap** (gratuita em [openweathermap.org](https://openweathermap.org/api))
- **Chave API OpenAI** (obtenha em [platform.openai.com](https://platform.openai.com/api-keys))
- **Conta Pinecone** (gratuita em [app.pinecone.io](https://app.pinecone.io/))
- **MongoDB** (local ou MongoDB Atlas)

#### Instalação

1. **Clone e instale as dependências:**
```bash
cd ia-surf-conditions
npm install
```

2. **Configure as variáveis de ambiente:**
```bash
cp env.example .env
# Edite .env e adicione suas chaves de API:
# - OPENWEATHER_API_KEY
# - OPENAI_API_KEY  
# - PINECONE_API_KEY
# - PINECONE_ENVIRONMENT
# - MONGODB_URI
```

3. **Compile o projeto:**
```bash
npm run build
```

4. **Execute a aplicação:**
```bash
npm start
```

### 🛠️ Desenvolvimento

#### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Executar com ts-node
npm run watch        # Modo watch para desenvolvimento
npm run build        # Compilar TypeScript para JavaScript
npm run start        # Executar aplicação compilada

# Qualidade do Código
npm run lint         # Executar ESLint
npm run lint:fix    # Corrigir problemas do ESLint
npm test            # Executar testes
npm run clean       # Limpar diretório de build
```

### 🤖 Arquitetura IA

#### Workflow LangGraph
O sistema usa LangGraph para orquestrar múltiplos agentes de IA:

1. **Agente de Dados Climáticos** - Busca dados de clima e oceano em tempo real
2. **Agente de Contexto RAG** - Recupera conhecimento relevante de surf do banco de dados vetorial
3. **Agente de Análise de Condições** - Analisa condições atuais de surf
4. **Agente de Análise LLM** - Gera insights e recomendações powered by IA
5. **Agente de Armazenamento** - Salva resultados no MongoDB e Pinecone

#### RAG (Retrieval-Augmented Generation)
- **Base de Conhecimento**: Condições históricas de surf e conhecimento especializado
- **Busca Vetorial**: Pinecone para recuperação baseada em similaridade
- **Aprimoramento de Contexto**: API OpenWeatherMap para dados em tempo real
- **Integração LLM**: GPT-4 para análise inteligente e recomendações

#### Fluxo de Dados
```
Solicitação do Usuário → Workflow LangGraph → API Climática → Sistema RAG → Análise LLM → Armazenamento Vetorial → Resposta Personalizada
```

### 📊 Referência da API

#### Tipos Principais

```typescript
interface SurfConditions {
  location: string;
  timestamp: Date;
  waves: WaveData;
  wind: WindData;
  tide: TideData;
  weather: WeatherData;
  rating: SurfRating;
  recommendations: string[];
}

interface SurfSpot {
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
```

#### Serviços

##### WeatherService
- `getCurrentWeather(lat, lon)` - Obter condições climáticas atuais
- `getWindData(lat, lon)` - Obter velocidade e direção do vento
- `getTideData(lat, lon)` - Obter informações de maré
- `getForecast(lat, lon, days)` - Obter previsão de múltiplos dias

##### SurfService
- `analyzeSurfConditions(spot)` - Analisar condições de surf para um spot
- `getBestSurfTimes(spot, days)` - Obter horários ótimos de surf

### 🌊 Exemplo de Uso

```typescript
import { SurfConditionsApp } from './src/index';

// Criar instância da aplicação
const app = new SurfConditionsApp();

// Definir um spot de surf
const malibu = {
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
    windDirection: [270, 315],
    swellDirection: [200, 250],
    tideRange: [2, 6]
  }
};

// Obter condições de surf
await app.getSurfConditions(malibu);
```

### 🧪 Testes

```bash
# Executar todos os testes
npm test

# Executar testes com cobertura
npm test -- --coverage

# Executar testes em modo watch
npm test -- --watch
```

### 📦 Build & Deploy

#### Build de Produção
```bash
npm run build
npm start
```

#### Docker (Opcional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
CMD ["npm", "start"]
```

### 🔧 Configuração

#### Variáveis de Ambiente

| Variável | Descrição | Obrigatório |
|----------|-----------|-------------|
| `OPENWEATHER_API_KEY` | Chave API OpenWeatherMap | Sim |
| `OPENAI_API_KEY` | Chave API OpenAI | Sim |
| `PINECONE_API_KEY` | Chave API Pinecone | Sim |
| `PINECONE_ENVIRONMENT` | Ambiente Pinecone | Sim |
| `MONGODB_URI` | URI MongoDB | Sim |

#### Configuração TypeScript

O projeto usa configuração TypeScript rigorosa com:
- Verificação de tipos rigorosa
- Sem any implícito
- Detecção de variáveis não utilizadas
- Aplicação consistente de maiúsculas/minúsculas

### 🤝 Contribuindo

1. Faça fork do repositório
2. Crie uma branch de feature: `git checkout -b feature/amazing-feature`
3. Commit suas mudanças: `git commit -m 'Add amazing feature'`
4. Push para a branch: `git push origin feature/amazing-feature`
5. Abra um Pull Request

### 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

### 🙏 Agradecimentos

- [OpenWeatherMap](https://openweathermap.org/) pelos dados climáticos
- [NOAA](https://www.noaa.gov/) pelos dados oceânicos
- Comunidade TypeScript pelas excelentes ferramentas

### 📞 Suporte

Para suporte, envie email para emirdeliz@gmail.com ou crie uma issue no repositório.

---

**Bom Surf! 🏄‍♂️🌊**

---

**Happy Surfing! 🏄‍♂️🌊**
