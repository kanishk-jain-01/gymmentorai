import OpenAI from 'openai';
import { llmConfig } from './llm-config';

// Initialize OpenAI client if using OpenAI
export const openaiClient = llmConfig?.provider === 'openai' 
  ? new OpenAI({ apiKey: llmConfig.apiKey })
  : null;

/**
 * Options for LLM API calls
 */
export interface LLMOptions {
  type?: string;
  tools?: any[];
  tool_choice?: string | object;
}

/**
 * Make an LLM API call with the configured provider
 */
export async function callLLM(messages: any[], options?: LLMOptions): Promise<any> {
  if (!llmConfig) {
    throw new Error('LLM service not configured');
  }
  
  try {
    // OpenAI implementation
    if (llmConfig.provider === 'openai') {
      if (!openaiClient) throw new Error('OpenAI client not initialized');
      
      const response = await openaiClient.chat.completions.create({
        model: llmConfig.model || 'gpt-4o',
        messages,
        response_format: options?.type ? { type: options.type } as any : undefined,
        tools: options?.tools,
        tool_choice: options?.tool_choice as any
      });
      return response;
    }
    throw new Error(`Unsupported LLM provider: ${llmConfig.provider}`);
  } catch (error) {
    console.error(`${llmConfig.provider} API call failed:`, error);
    throw error;
  }
} 