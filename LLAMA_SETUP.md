# Configuração do Llama Local

Este projeto usa exclusivamente o Llama local através do Ollama, permitindo análises de surf sem depender de APIs externas.

## Instalação do Ollama

1. **Instale o Ollama:**
   ```bash
   # macOS
   brew install ollama
   
   # Ou baixe de: https://ollama.ai/
   ```

2. **Inicie o serviço Ollama:**
   ```bash
   ollama serve
   ```

3. **Baixe um modelo Llama:**
   ```bash
   # Modelo recomendado (menor e mais rápido)
   ollama pull llama3.2
   
   # Ou modelos maiores para melhor qualidade
   ollama pull llama3.1
   ollama pull llama3.1:70b
   ```

## Configuração do Projeto

1. **Copie o arquivo de configuração:**
   ```bash
   cp env.example .env
   ```

2. **Configure as variáveis de ambiente no `.env`:**
   ```env
   # Configuração do Llama
   LLAMA_BASE_URL=http://localhost:11434
   LLAMA_MODEL=llama3.2
   
   # Suas outras configurações...
   OPENWEATHER_API_KEY=sua_chave_aqui
   ```

## Uso

1. **Instale as dependências:**
   ```bash
   yarn install
   ```

2. **Execute o projeto:**
   ```bash
   yarn dev
   ```

3. **Teste a integração:**
   ```bash
   # Teste básico do Llama
   node test-llama.js
   
   # Teste do RAGService com Llama
   node test-rag-llama.js
   ```

O sistema irá:
- Verificar se o Ollama está rodando
- Listar os modelos disponíveis
- Usar o Llama para análises de surf
- Usar o Llama para RAG (Retrieval-Augmented Generation)

## Serviços que Usam Llama

Os seguintes serviços usam exclusivamente Llama local:

- **LLMService**: Análise de condições de surf, previsões e recomendações personalizadas
- **RAGService**: Geração de conhecimento sobre surf usando RAG (Retrieval-Augmented Generation)
- **SurfAnalysisWorkflow**: Workflow completo de análise de surf

O projeto foi simplificado para usar apenas Llama, removendo a complexidade de múltiplos provedores.

## Modelos Llama Recomendados

- **llama3.2** - Mais rápido, bom para desenvolvimento
- **llama3.1** - Melhor qualidade, mais lento
- **llama3.1:70b** - Melhor qualidade, requer mais RAM

## Troubleshooting

### Ollama não está rodando
```bash
# Verifique se o Ollama está rodando
curl http://localhost:11434/api/tags

# Inicie o Ollama se necessário
ollama serve
```

### Modelo não encontrado
```bash
# Liste modelos disponíveis
ollama list

# Baixe o modelo necessário
ollama pull llama3.2
```

### Erro de conexão
- Verifique se a porta 11434 está livre
- Confirme que o Ollama está rodando
- Verifique se o modelo foi baixado corretamente
