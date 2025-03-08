import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

if (!openai) {
  console.warn('OpenAI API key not found. Using mock data for development.');
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

// Mock parsed workout for development
const mockParsedWorkout: ParsedWorkout = {
  name: "Full Body Workout",
  date: new Date(),
  duration: 60,
  notes: "Felt strong today",
  exercises: [
    {
      name: "Bench Press",
      sets: 3,
      reps: 10,
      weight: 185,
    },
    {
      name: "Squats",
      sets: 3,
      reps: 8,
      weight: 225,
    },
    {
      name: "Treadmill",
      duration: 1200, // 20 minutes in seconds
      distance: 2.5,
      notes: "Moderate pace"
    }
  ]
};

/**
 * Parse a natural language workout description into structured data
 * In development, returns mock data
 * In production, uses OpenAI
 */
export async function parseWorkoutText(text: string): Promise<ParsedWorkout> {
  // First check if Ollama is configured
  if (process.env.OLLAMA_URL) {
    console.log('Using Ollama for workout parsing');
    try {
      return await parseWithOllama(text);
    } catch (error) {
      console.error('Ollama parsing failed, falling back to alternatives:', error);
      // Fall through to next options if Ollama fails
    }
  }
  
  // Then try OpenAI if available
  if (openai && process.env.NODE_ENV === 'production') {
    try {
      // Use OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
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
            For exercises, at minimum include the name.`
          },
          {
            role: "user",
            content: text
          }
        ],
        response_format: { type: "json_object" }
      });
      
      const parsedResponse = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        name: parsedResponse.name,
        date: parsedResponse.date ? new Date(parsedResponse.date) : new Date(),
        duration: parsedResponse.duration,
        notes: parsedResponse.notes,
        exercises: Array.isArray(parsedResponse.exercises) 
          ? parsedResponse.exercises.map((ex: any) => ({
              name: ex.name,
              sets: ex.sets,
              reps: ex.reps,
              weight: ex.weight,
              duration: ex.duration,
              distance: ex.distance,
              notes: ex.notes,
            }))
          : [],
      };
    } catch (error) {
      console.error('OpenAI parsing failed:', error);
      // Fall through to mock data
    }
  }
  
  // In development or if all else fails, return mock data
  console.log('Using mock workout data (development mode or AI services unavailable)');
  return {
    ...mockParsedWorkout,
    date: new Date(), // Always use current date for the mock
  };
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
      
      // Convert to our ParsedWorkout format
      return {
        name: parsedData.name,
        date: parsedData.date ? new Date(parsedData.date) : new Date(),
        duration: parsedData.duration,
        notes: parsedData.notes,
        exercises: Array.isArray(parsedData.exercises) 
          ? parsedData.exercises.map((ex: any) => ({
              name: ex.name,
              sets: ex.sets,
              reps: ex.reps,
              weight: ex.weight,
              duration: ex.duration,
              distance: ex.distance,
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
    // Fall back to mock data if Ollama fails
    return {
      ...mockParsedWorkout,
      date: new Date(),
    };
  }
} 