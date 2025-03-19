import { ensureNumericType } from '@/lib/utils';
import { ParsedWorkout } from '@/types';
import { callLLM } from './llm-client';
import { isAIAvailable } from './llm-config';
import { 
  kgToLbs, 
  kmToMeters, 
  milesToMeters, 
  mmssToSeconds, 
  minutesToSeconds, 
  hoursToSeconds 
} from '@/lib/utils';

// Define interfaces for tool calls
interface ToolCall {
  id: string;
  function: {
    name: string;
    arguments: string;
  };
}

interface ToolResult {
  tool_call_id: string;
  function: {
    name: string;
    arguments: string;
  };
  result: string;
}

/**
 * Normalize workout text by converting units to standard formats
 * - weights to lbs
 * - durations to seconds
 * - distances to meters
 */
export async function normalizeWorkoutText(text: string): Promise<string> {
  if (!isAIAvailable()) {
    throw new Error('No LLM service configured. Please set up an LLM API provider.');
  }
  
  try {
    // Use tool-calling to normalize units
    const response = await callLLM([
      {
        role: "system",
        content: `You are a fitness assistant that normalizes workout descriptions.
        Convert all measurements to standard units using the provided tools:
        - Weights: Convert to pounds (lbs)
        - Durations: Convert to seconds
        - Distances: Convert to meters
        
        Use the following tools for conversions:
        - convertWeight: Converts weight from kg to lbs
        - convertDistance: Converts distance to meters (km or miles)
        - convertDuration: Converts time formats to seconds (MM:SS format, minutes, hours)
        
        Examples of what you should convert:
        - "3 sets of 10 squats with 50kg" → "3 sets of 10 squats with 110lbs"
        - "Ran for 5km" → "Ran for 5000 meters"
        - "Plank for 1:30" → "Plank for 90 seconds"
        - "Cycled for 30 mins" → "Cycled for 1800 seconds"
        
        Return the normalized text while preserving the original meaning and structure.`
      },
      {
        role: "user",
        content: text
      }
    ], { 
      type: "text",
      tools: [
        {
          type: "function",
          function: {
            name: "convertWeight",
            description: "Convert weight from kg to lbs",
            parameters: {
              type: "object",
              properties: {
                value: {
                  type: "number",
                  description: "The weight value to convert"
                },
                unit: {
                  type: "string",
                  enum: ["kg"],
                  description: "The source unit (kg)"
                }
              },
              required: ["value", "unit"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "convertDistance",
            description: "Convert distance to meters",
            parameters: {
              type: "object",
              properties: {
                value: {
                  type: "number",
                  description: "The distance value to convert"
                },
                unit: {
                  type: "string",
                  enum: ["km", "mi", "miles"],
                  description: "The source unit (km, mi, or miles)"
                }
              },
              required: ["value", "unit"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "convertDuration",
            description: "Convert time formats to seconds",
            parameters: {
              type: "object",
              properties: {
                format: {
                  type: "string",
                  enum: ["MM:SS", "minutes", "hours"],
                  description: "The time format being converted"
                },
                mmss: {
                  type: "string",
                  description: "Time in MM:SS format (e.g., '3:45')"
                },
                minutes: {
                  type: "number",
                  description: "Minutes component"
                },
                hours: {
                  type: "number",
                  description: "Hours component"
                }
              },
              required: ["format"]
            }
          }
        }
      ],
      tool_choice: "auto"
    });
    
    // Handle tool calls
    if (response.choices[0].message.tool_calls && response.choices[0].message.tool_calls.length > 0) {
      // Process each tool call
      const toolCalls = response.choices[0].message.tool_calls as ToolCall[];
      const toolResults: ToolResult[] = [];
      
      for (const toolCall of toolCalls) {
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);
        
        // Execute the appropriate conversion using our utility functions
        let result;
        switch (functionName) {
          case 'convertWeight':
            result = kgToLbs(args.value);
            break;
          case 'convertDistance':
            if (args.unit === 'km') {
              result = kmToMeters(args.value);
            } else if (args.unit === 'mi' || args.unit === 'miles') {
              result = milesToMeters(args.value);
            }
            break;
          case 'convertDuration':
            if (args.format === 'MM:SS' && args.mmss) {
              result = mmssToSeconds(args.mmss);
            } else if (args.format === 'minutes' && args.minutes) {
              result = minutesToSeconds(args.minutes);
            } else if (args.format === 'hours' && args.hours) {
              result = hoursToSeconds(args.hours);
            }
            break;
        }
        
        toolResults.push({
          tool_call_id: toolCall.id,
          function: { name: functionName, arguments: toolCall.function.arguments },
          result: JSON.stringify({ result })
        });
      }
      
      // Send all results back to the LLM
      const followUpResponse = await callLLM([
        {
          role: "system",
          content: `You are a fitness assistant that normalizes workout descriptions.
          Continue normalizing the workout text with the conversion results.`
        },
        {
          role: "user",
          content: text
        },
        response.choices[0].message,
        ...toolResults.map(result => ({
          role: "tool",
          tool_call_id: result.tool_call_id,
          name: result.function.name,
          content: result.result
        }))
      ], { type: "text" });
      
      return followUpResponse.choices[0].message.content || text;
    }
    
    return response.choices[0].message.content || text;
  } catch (error) {
    console.error('Workout text normalization failed:', error);
    // Fall back to original text if normalization fails
    return text;
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
    // First normalize the workout text
    const normalizedText = await normalizeWorkoutText(text);
    
    // Use the configured LLM provider with a simplified prompt
    const response = await callLLM([
      {
        role: "system",
        content: `You are a fitness assistant that extracts workout information from user input.
        Parse the following workout description and return a JSON object with the following structure:
        {
          "name": "optional workout name",
          "duration": optional duration in minutes,
          "notes": "optional notes",
          "exercises": [
            {
              "name": "exercise name",
              "notes": "optional notes for this exercise",
              "sets": [
                {
                  "reps": optional number of reps,
                  "weight": optional weight in lbs,
                  "duration": optional duration in seconds,
                  "distance": optional distance in meters,
                  "notes": "optional notes for this specific set"
                }
              ]
            }
          ]
        }
        
        Only include fields that are explicitly mentioned or can be reasonably inferred.
        For exercises, at minimum include the name.
        
        IMPORTANT INSTRUCTIONS FOR PARSING SETS:
        1. If the user specifies multiple sets with the same values (e.g., "3x10 pushups"), create 3 separate set objects with 10 reps each
        2. If the user specifies different sets (e.g., "2x8x100lb bench press, 1x10x115 lbs bench press"), group them under the same exercise with different set configurations
        3. If no specific set information is provided, create a single set with the available information
        
        IMPORTANT INSTRUCTIONS FOR EXERCISE NAMES:
        1. Normalize all exercise names to a standard format
        2. Use proper capitalization (e.g., "Bench Press" not "bench press")
        3. Use the plural form for bodyweight exercises (e.g., "Pushups" not "Pushup")
        4. Standardize common variations:
           - "pushup", "push up", "push-up" should all be "Pushups"
           - "pullup", "pull up", "pull-up" should all be "Pullups"
           - "squat" should be "Squats"
           - "bench", "bench press", "benchpress" should all be "Bench Press"
           - "deadlift" should be "Deadlifts"
           - "running", "run", "jogging", "jog" should all be "Running"
        5. Correct minor spelling mistakes (e.g., "puships" should be "Pushups")
        
        IMPORTANT: All numeric values (reps, weight, duration, distance) must be numbers, not strings.`
      },
      {
        role: "user",
        content: normalizedText
      }
    ], { type: "json_object" });
    
    const parsedResponse = JSON.parse(response.choices[0].message.content || '{}');
    
    // Ensure numeric values are properly converted and sets are properly structured
    return {
      name: parsedResponse.name,
      date: (() => {
        // Create a full ISO timestamp at midnight to keep the date part but satisfy Prisma
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        
        // Return a full ISO timestamp with time set to midnight
        return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
      })(),
      duration: ensureNumericType(parsedResponse.duration),
      notes: parsedResponse.notes,
      exercises: Array.isArray(parsedResponse.exercises) 
        ? parsedResponse.exercises.map((ex: any) => ({
            name: ex.name, // The LLM should now return normalized names
            notes: ex.notes,
            sets: Array.isArray(ex.sets) 
              ? ex.sets.map((set: any) => ({
                  reps: ensureNumericType(set.reps),
                  weight: ensureNumericType(set.weight),
                  duration: ensureNumericType(set.duration),
                  distance: ensureNumericType(set.distance),
                  notes: set.notes,
                }))
              : [], // Ensure we always have a sets array
          }))
        : [],
    };
  } catch (error) {
    console.error('LLM parsing failed:', error);
    throw new Error('Failed to parse workout text: AI service error');
  }
} 