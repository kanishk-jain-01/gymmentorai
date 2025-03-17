import { ensureNumericType } from '@/lib/utils';
import { ParsedWorkout } from '@/types';
import { callLLM } from './llm-client';
import { isAIAvailable } from './llm-config';

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
          "duration": optional duration in minutes,
          "notes": "optional notes",
          "exercises": [
            {
              "name": "exercise name",
              "notes": "optional notes for this exercise",
              "sets": [
                {
                  "reps": optional number of reps,
                  "weight": optional weight in lbs or kg,
                  "duration": optional duration in seconds (convert any MM:SS format to total seconds),
                  "distance": optional distance in miles or km,
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
        
        IMPORTANT INSTRUCTIONS FOR DURATIONS:
        1. If the user specifies a duration in MM:SS format (e.g., "3:45"), convert it to total seconds (e.g., 225)
        2. If the user specifies a duration in just minutes (e.g., "3 minutes"), convert it to seconds (e.g., 180)
        3. If the user specifies a duration in just seconds (e.g., "45 seconds"), use that value directly
        
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
        content: text
      }
    ], { type: "json_object" });
    
    const parsedResponse = JSON.parse(response.choices[0].message.content || '{}');
    
    // Ensure numeric values are properly converted and sets are properly structured
    return {
      name: parsedResponse.name,
      date: new Date(),
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