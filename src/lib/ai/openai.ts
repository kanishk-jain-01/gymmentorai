import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

if (!openai) {
  console.warn('OpenAI API key not found. AI features will be limited.');
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
  return !!openai || !!process.env.OLLAMA_URL;
}

/**
 * Make an OpenAI API call with error handling
 */
async function callOpenAI(messages: any[], responseFormat?: { type: string }) {
  if (!openai) {
    throw new Error('OpenAI client not initialized');
  }
  
  try {
    return await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      response_format: responseFormat as any
    });
  } catch (error) {
    console.error('OpenAI API call failed:', error);
    throw error;
  }
}

/**
 * Parse a natural language workout description into structured data
 * Uses OpenAI or Ollama depending on configuration
 */
export async function parseWorkoutText(text: string): Promise<ParsedWorkout> {
  // First check if Ollama is configured
  if (process.env.OLLAMA_URL) {
    console.log('Using Ollama for workout parsing');
    try {
      return await parseWithOllama(text);
    } catch (error) {
      console.error('Ollama parsing failed, falling back to OpenAI:', error);
      // Fall through to OpenAI if Ollama fails
    }
  }
  
  // Then try OpenAI
  if (openai) {
    try {
      // Use OpenAI
      const response = await callOpenAI([
        {
          role: "system",
          content: `You are a fitness assistant that extracts workout information from user input.
          Parse the following workout description and return a JSON object with the following structure:
          {
            "name": "optional workout name",
            "date": "ISO date string (use today if not specified)",
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
      console.error('OpenAI parsing failed:', error);
      throw new Error('Failed to parse workout text: AI services unavailable or error occurred');
    }
  }
  
  // If no AI services are available
  throw new Error('No AI services available. Please configure OpenAI API key or Ollama URL.');
}

/**
 * Analyze workout data and provide insights
 */
export async function analyzeWorkouts(workoutData: any[]): Promise<string> {
  if (workoutData.length === 0) {
    return "Not enough workout data to provide analysis. Please log more workouts.";
  }
  
  // Check if OpenAI is available
  if (!openai) {
    throw new Error('OpenAI API key not configured. Analysis features unavailable.');
  }
  
  try {
    // Get AI analysis
    const response = await callOpenAI([
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

/**
 * Parse workout text using Ollama
 * This is an optional function that will be used if OLLAMA_URL is set
 */
async function parseWithOllama(text: string): Promise<ParsedWorkout> {
  try {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    const ollamaModel = process.env.OLLAMA_MODEL || 'llama3.1:latest';
    
    console.log(`Sending request to Ollama at ${ollamaUrl} using model ${ollamaModel}`);
    
    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: ollamaModel,
        prompt: `You are a fitness assistant that extracts workout information from user input.
        Parse the following workout description and return a JSON object with the following structure:
        {
          "name": "optional workout name",
          "date": "ISO date string (use today if not specified)",
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
        
        User input: ${text}
        
        IMPORTANT: All numeric values (sets, reps, weight, duration, distance) must be numbers, not strings.
        Respond using JSON format only.`,
        stream: false,
        format: "json" // Use Ollama's JSON format option
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Ollama API returned status ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Ollama response structure:', Object.keys(data));
    
    if (!data.response) {
      console.log('Full Ollama response:', JSON.stringify(data, null, 2));
      throw new Error('Unexpected response format from Ollama: missing response field');
    }
    
    console.log('Ollama response excerpt:', data.response.substring(0, 100) + '...');
    
    // Parse the JSON response
    try {
      // The response should already be JSON, but might be a string representation
      const parsedData = typeof data.response === 'string' 
        ? JSON.parse(data.response.trim()) 
        : data.response;
      
      console.log('Parsed workout data:', JSON.stringify(parsedData, null, 2).substring(0, 100) + '...');
      
      // Convert to our ParsedWorkout format with proper numeric type conversion
      return {
        name: parsedData.name,
        date: parsedData.date ? new Date(parsedData.date) : new Date(),
        duration: ensureNumericType(parsedData.duration),
        notes: parsedData.notes,
        exercises: Array.isArray(parsedData.exercises) 
          ? parsedData.exercises.map((ex: any) => ({
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
    } catch (parseError) {
      console.error('Error parsing Ollama JSON response:', parseError);
      console.log('Raw response that failed to parse:', data.response);
      throw new Error('Failed to parse Ollama response as JSON');
    }
  } catch (error) {
    console.error('Error parsing with Ollama:', error);
    throw error;
  }
} 