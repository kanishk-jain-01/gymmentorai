import { callLLM } from './llm-client';
import { isAIAvailable } from './llm-config';

/**
 * Validates if the provided text is describing a workout or exercise activity
 * @param text The text to validate
 * @returns A boolean indicating if the text is workout-related
 */
export async function validateWorkoutText(text: string): Promise<boolean> {
  if (!isAIAvailable()) {
    throw new Error('No LLM service configured. Please set up an LLM API provider.');
  }
   
  try {
    // Use the configured LLM provider
    const response = await callLLM([
      {
        role: 'system',
        content: 'You are a fitness expert assistant. Your task is to determine if the provided text is describing a workout or exercise activity that someone already did. Respond with a JSON object with a single boolean field "isWorkoutRelated".'
      },
      {
        role: 'user',
        content: text
      }
    ], { type: 'json_object' });
    
    // Parse the response
    const content = response.choices[0]?.message?.content || '{"isWorkoutRelated": false}';
    const parsedContent = JSON.parse(content);
    
    return parsedContent.isWorkoutRelated;
  } catch (error) {
    console.error('LLM validation failed:', error);
    throw new Error('Failed to validate workout text: AI service error');
  }
} 