/**
 * Shared type definitions for the application
 */

/**
 * Exercise type representing a single exercise in a workout
 */
export interface Exercise {
  id: string;
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number;
  distance?: number;
  notes?: string;
  createdAt?: string;
}

/**
 * Workout type representing a complete workout session
 */
export interface Workout {
  id: string;
  date: string;
  name?: string;
  notes?: string;
  duration?: number;
  rawInput?: string;
  userId?: string;
  exercises: Exercise[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Parsed workout from LLM service
 */
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