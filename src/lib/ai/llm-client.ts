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
    
    // Anthropic implementation
    if (llmConfig.provider === 'anthropic') {
      // Note: Anthropic's API may have different tool calling syntax
      // This is a simplified implementation
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': llmConfig.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: llmConfig.model || 'claude-3-opus-20240229',
          messages,
          ...(options?.type === 'json_object' ? { response_format: { type: 'json_object' } } : {}),
          ...(options?.tools ? { tools: options.tools } : {})
        })
      });
      
      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return {
        choices: [{ 
          message: { 
            content: data.content[0].text,
            tool_calls: data.tool_calls
          } 
        }]
      };
    }
    
    // Google AI implementation
    if (llmConfig.provider === 'google') {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${llmConfig.model || 'gemini-1.5-pro'}:generateContent?key=${llmConfig.apiKey}`;
      
      // Convert messages to Google's format
      const googleMessages = messages.map(msg => ({
        role: msg.role === 'system' ? 'user' : msg.role,
        parts: [{ text: msg.content }]
      }));
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: googleMessages,
          generationConfig: {
            ...(options?.type === 'json_object' ? { response_schema: { type: 'json_object' } } : {})
          },
          // Google's tool calling format may differ
          ...(options?.tools ? { tools: options.tools } : {})
        })
      });
      
      if (!response.ok) {
        throw new Error(`Google AI API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return {
        choices: [{ 
          message: { 
            content: data.candidates[0].content.parts[0].text,
            tool_calls: data.candidates[0].content.parts.filter((p: any) => p.functionCall).map((p: any) => ({
              function: p.functionCall
            }))
          } 
        }]
      };
    }
    
    // Custom API implementation
    if (llmConfig.provider === 'custom' && llmConfig.apiUrl) {
      const response = await fetch(llmConfig.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${llmConfig.apiKey}`
        },
        body: JSON.stringify({
          model: llmConfig.model,
          messages,
          ...(options?.type === 'json_object' ? { response_format: { type: 'json_object' } } : {}),
          ...(options?.tools ? { tools: options.tools } : {}),
          ...(options?.tool_choice ? { tool_choice: options.tool_choice } : {})
        })
      });
      
      if (!response.ok) {
        throw new Error(`Custom LLM API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return {
        choices: [{ 
          message: { 
            content: data.choices?.[0]?.message?.content || data.response || data.output || '',
            tool_calls: data.choices?.[0]?.message?.tool_calls
          } 
        }]
      };
    }
    
    throw new Error(`Unsupported LLM provider: ${llmConfig.provider}`);
  } catch (error) {
    console.error(`${llmConfig.provider} API call failed:`, error);
    throw error;
  }
} 