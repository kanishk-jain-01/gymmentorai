// LLM Provider Types
export type LLMProvider = 'openai' | 'anthropic' | 'google' | 'custom';

// LLM Configuration
export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  apiUrl?: string;
  model?: string;
}

/**
 * Initialize the LLM client based on environment variables
 */
export function getLLMConfig(): LLMConfig | null {
  // OpenAI is the default provider
  if (process.env.OPENAI_API_KEY) {
    return {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4o'
    };
  }
  
  // Anthropic (Claude) support
  if (process.env.ANTHROPIC_API_KEY) {
    return {
      provider: 'anthropic',
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229'
    };
  }
  
  // Google (Gemini) support
  if (process.env.GOOGLE_AI_API_KEY) {
    return {
      provider: 'google',
      apiKey: process.env.GOOGLE_AI_API_KEY,
      model: process.env.GOOGLE_AI_MODEL || 'gemini-1.5-pro'
    };
  }
  
  // Custom API endpoint
  if (process.env.CUSTOM_LLM_API_KEY && process.env.CUSTOM_LLM_API_URL) {
    return {
      provider: 'custom',
      apiKey: process.env.CUSTOM_LLM_API_KEY,
      apiUrl: process.env.CUSTOM_LLM_API_URL,
      model: process.env.CUSTOM_LLM_MODEL
    };
  }
  
  return null;
}

// Get the LLM configuration
export const llmConfig = getLLMConfig();

/**
 * Check if AI services are available
 */
export function isAIAvailable(): boolean {
  return !!llmConfig;
}

if (!llmConfig) {
  console.warn('No LLM API configuration found. AI features will be unavailable.');
} 