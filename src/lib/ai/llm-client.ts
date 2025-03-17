import OpenAI from 'openai';
import { llmConfig } from './llm-config';

// Initialize OpenAI client if using OpenAI
export const openaiClient = llmConfig?.provider === 'openai' 
  ? new OpenAI({ apiKey: llmConfig.apiKey })
  : null;

/**
 * Make an LLM API call with the configured provider
 */
export async function callLLM(messages: any[], responseFormat?: { type: string }): Promise<any> {
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
        response_format: responseFormat as any
      });
      
      return response;
    }
    
    // Anthropic implementation
    if (llmConfig.provider === 'anthropic') {
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
          ...(responseFormat?.type === 'json_object' ? { response_format: { type: 'json_object' } } : {})
        })
      });
      
      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return {
        choices: [{ message: { content: data.content[0].text } }]
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
            ...(responseFormat?.type === 'json_object' ? { response_schema: { type: 'json_object' } } : {})
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Google AI API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return {
        choices: [{ message: { content: data.candidates[0].content.parts[0].text } }]
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
          ...(responseFormat?.type === 'json_object' ? { response_format: { type: 'json_object' } } : {})
        })
      });
      
      if (!response.ok) {
        throw new Error(`Custom LLM API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return {
        choices: [{ message: { content: data.choices?.[0]?.message?.content || data.response || data.output || '' } }]
      };
    }
    
    throw new Error(`Unsupported LLM provider: ${llmConfig.provider}`);
  } catch (error) {
    console.error(`${llmConfig.provider} API call failed:`, error);
    throw error;
  }
} 