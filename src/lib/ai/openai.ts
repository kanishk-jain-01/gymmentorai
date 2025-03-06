import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
  // In development, return mock data
  if (process.env.NODE_ENV !== 'production') {
    console.log('Using mock workout data in development mode');
    return {
      ...mockParsedWorkout,
      date: new Date(), // Always use current date for the mock
    };
  }
  
  try {
    // Try to use Ollama if OLLAMA_URL is set
    if (process.env.OLLAMA_URL) {
      return await parseWithOllama(text);
    }
    
    // Otherwise use OpenAI
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
                "weight": optional weight in kg or lbs (specify unit in notes),
                "duration": optional duration in seconds,
                "distance": optional distance in km or miles (specify unit in notes),
                "notes": "optional notes about this exercise"
              }
            ]
          }
          
          If you're unsure about any value, omit it from the JSON rather than guessing.
          If no exercises are mentioned, return an empty array for exercises.`
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Ensure date is a Date object
    if (result.date) {
      result.date = new Date(result.date);
    } else {
      result.date = new Date();
    }
    
    // Ensure exercises is an array
    if (!result.exercises) {
      result.exercises = [];
    }
    
    return result as ParsedWorkout;
  } catch (error) {
    console.error('Error parsing workout text:', error);
    // Return a minimal valid object if parsing fails
    return {
      date: new Date(),
      exercises: []
    };
  }
}

/**
 * Parse workout text using Ollama
 * This is an optional function that will be used if OLLAMA_URL is set
 */
async function parseWithOllama(text: string): Promise<ParsedWorkout> {
  try {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3', // or whatever model you have in Ollama
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
              "weight": optional weight in kg or lbs (specify unit in notes),
              "duration": optional duration in seconds,
              "distance": optional distance in km or miles (specify unit in notes),
              "notes": "optional notes about this exercise"
            }
          ]
        }
        
        If you're unsure about any value, omit it from the JSON rather than guessing.
        If no exercises are mentioned, return an empty array for exercises.
        
        User input: ${text}
        
        JSON response:`,
        stream: false,
      }),
    });
    
    const data = await response.json();
    const jsonMatch = data.response.match(/```json\n([\s\S]*?)\n```/) || 
                     data.response.match(/```\n([\s\S]*?)\n```/) ||
                     data.response.match(/{[\s\S]*?}/);
                     
    let jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : data.response;
    
    // Clean up the JSON string
    jsonStr = jsonStr.replace(/^```json\n|^```\n|```$/g, '').trim();
    
    // Parse the JSON
    const result = JSON.parse(jsonStr);
    
    // Ensure date is a Date object
    if (result.date) {
      result.date = new Date(result.date);
    } else {
      result.date = new Date();
    }
    
    // Ensure exercises is an array
    if (!result.exercises) {
      result.exercises = [];
    }
    
    return result as ParsedWorkout;
  } catch (error) {
    console.error('Error parsing with Ollama:', error);
    // Fall back to mock data if Ollama fails
    return {
      ...mockParsedWorkout,
      date: new Date(),
    };
  }
} 