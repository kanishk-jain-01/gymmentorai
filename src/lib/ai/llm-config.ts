// LLM Configuration
interface LLMConfig {
  provider: string;
  apiKey: string;
  model?: string;
}

// Initialize OpenAI LLM client based on environment variables
function getLLMConfig(): LLMConfig | null {
  if (process.env.OPENAI_API_KEY) {
    return {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4o'
    };
  }
  return null;
}

// Get the LLM configuration
export const llmConfig = getLLMConfig();

// Check if AI services are available
export function isAIAvailable(): boolean {
  return !!llmConfig;
}

if (!llmConfig) {
  console.warn('No LLM API configuration found. AI features will be unavailable.');
} 