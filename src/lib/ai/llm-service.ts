import OpenAI from 'openai';

// LLM Provider Types
export type LLMProvider = 'openai' | 'anthropic' | 'google' | 'custom';

// LLM Configuration
interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  apiUrl?: string;
  model?: string;
}

// Initialize the LLM client based on environment variables
function getLLMConfig(): LLMConfig | null {
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
const llmConfig = getLLMConfig();

// Initialize OpenAI client if using OpenAI
const openaiClient = llmConfig?.provider === 'openai' 
  ? new OpenAI({ apiKey: llmConfig.apiKey })
  : null;

if (!llmConfig) {
  console.warn('No LLM API configuration found. AI features will be unavailable.');
}

export interface ParsedWorkout {
  name?: string;
  date: Date;
  duration?: number;
  notes?: string;
  exercises: {
    name: string;
    sets?: number;
    reps?: number;
    weight?: number;
    duration?: number;
    distance?: number;
    notes?: string;
  }[];
}

// Helper function to ensure numeric values are properly converted
function ensureNumericType(value: any): number | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  
  // Convert string to number
  const num = Number(value);
  
  // Return undefined if not a valid number
  return isNaN(num) ? undefined : num;
}

/**
 * Check if AI services are available
 */
export function isAIAvailable(): boolean {
  return !!llmConfig;
}

/**
 * Make an LLM API call with the configured provider
 */
async function callLLM(messages: any[], responseFormat?: { type: string }): Promise<any> {
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

/**
 * Parse a natural language workout description into structured data
 * Uses the configured LLM provider
 */
export async function parseWorkoutText(text: string): Promise<ParsedWorkout> {
  if (!isAIAvailable()) {
    throw new Error('No LLM service configured. Please set up an LLM API provider.');
  }
  
  try {
    // Use the configured LLM provider
    const response = await callLLM([
      {
        role: "system",
        content: `You are a fitness assistant that extracts workout information from user input.
        Parse the following workout description and return a JSON object with the following structure:
        {
          "name": "optional workout name",
          "date": "ISO date string",
          "duration": optional duration in minutes,
          "notes": "optional notes",
          "exercises": [
            {
              "name": "exercise name",
              "sets": optional number of sets,
              "reps": optional number of reps,
              "weight": optional weight in lbs or kg,
              "duration": optional duration in seconds,
              "distance": optional distance in miles or km,
              "notes": "optional notes"
            }
          ]
        }
        
        Only include fields that are explicitly mentioned or can be reasonably inferred.
        For exercises, at minimum include the name.
        IMPORTANT: All numeric values (sets, reps, weight, duration, distance) must be numbers, not strings.`
      },
      {
        role: "user",
        content: text
      }
    ], { type: "json_object" });
    
    const parsedResponse = JSON.parse(response.choices[0].message.content || '{}');
    
    // Ensure numeric values are properly converted
    return {
      name: parsedResponse.name,
      date: parsedResponse.date ? new Date(parsedResponse.date) : new Date(),
      duration: ensureNumericType(parsedResponse.duration),
      notes: parsedResponse.notes,
      exercises: Array.isArray(parsedResponse.exercises) 
        ? parsedResponse.exercises.map((ex: any) => ({
            name: ex.name,
            sets: ensureNumericType(ex.sets),
            reps: ensureNumericType(ex.reps),
            weight: ensureNumericType(ex.weight),
            duration: ensureNumericType(ex.duration),
            distance: ensureNumericType(ex.distance),
            notes: ex.notes,
          }))
        : [],
    };
  } catch (error) {
    console.error('LLM parsing failed:', error);
    throw new Error('Failed to parse workout text: AI service error');
  }
}

/**
 * Analyze workout data and provide insights
 */
export async function analyzeWorkouts(workoutData: any[]): Promise<string> {
  if (workoutData.length === 0) {
    return "Not enough workout data to provide analysis. Please log more workouts.";
  }
  
  if (!isAIAvailable()) {
    throw new Error('No LLM service configured. Please set up an LLM API provider.');
  }
  
  try {
    // Get AI analysis using the configured provider
    const response = await callLLM([
      {
        role: "system",
        content: `You are a fitness coach analyzing workout data. 
        Provide insights, trends, and recommendations based on the user's recent workouts.
        Focus on progress, consistency, exercise balance, and potential areas for improvement.
        Keep your analysis concise but informative, with actionable advice.`
      },
      {
        role: "user",
        content: JSON.stringify(workoutData)
      }
    ]);
    
    return response.choices[0].message.content || "Unable to generate analysis.";
  } catch (error) {
    console.error('Error analyzing workouts:', error);
    throw new Error('Failed to analyze workouts: AI service error');
  }
} 