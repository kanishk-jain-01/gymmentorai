/**
 * Utility functions for the application
 */

/**
 * Ensures a value is converted to a number or undefined if invalid
 * @param value Any value to convert to a number
 * @returns A number or undefined if the value is null, undefined, or not a valid number
 */
export function ensureNumericType(value: any): number | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  
  // Convert string to number
  const num = Number(value);
  
  // Return undefined if not a valid number
  return isNaN(num) ? undefined : num;
}

/**
 * Converts seconds to MM:SS format for set durations
 * @param seconds Total seconds
 * @returns Formatted string in MM:SS format
 */
export function formatDuration(seconds?: number): string {
  if (seconds === undefined || seconds === null) return '';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Formats workout duration in minutes
 * @param minutes Workout duration in minutes
 * @returns Formatted string with minutes
 */
export function formatWorkoutDuration(minutes?: number): string {
  if (minutes === undefined || minutes === null) return '';
  return `${minutes} min`;
}

/**
 * Parses MM:SS format to seconds for set durations
 * @param mmss String in MM:SS format
 * @returns Total seconds as a number, or undefined if invalid
 */
export function parseDuration(mmss?: string): number | undefined {
  if (!mmss) return undefined;
  
  // Handle case where only minutes are provided (no colon)
  if (!mmss.includes(':')) {
    const minutes = parseInt(mmss, 10);
    return isNaN(minutes) ? undefined : minutes * 60;
  }
  
  const [minutesStr, secondsStr] = mmss.split(':');
  const minutes = parseInt(minutesStr, 10);
  const seconds = parseInt(secondsStr, 10);
  
  if (isNaN(minutes) || isNaN(seconds)) return undefined;
  
  return minutes * 60 + seconds;
}

/**
 * Organizes workouts by year
 */
export function organizeWorkoutsByYear(workouts: any[]) {
  const workoutsByYear: Record<string, any[]> = {};
  
  workouts.forEach(workout => {
    const date = new Date(workout.date);
    const year = date.getFullYear().toString();
    
    if (!workoutsByYear[year]) {
      workoutsByYear[year] = [];
    }
    
    workoutsByYear[year].push(workout);
  });
  
  return workoutsByYear;
}

/**
 * Organizes workouts by month for a specific year
 */
export function organizeWorkoutsByMonth(workouts: any[], year: string) {
  const workoutsByMonth: Record<string, any[]> = {};
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Filter workouts for the specified year
  const yearWorkouts = workouts.filter(workout => {
    const date = new Date(workout.date);
    return date.getFullYear().toString() === year;
  });
  
  // Organize by month
  yearWorkouts.forEach(workout => {
    const date = new Date(workout.date);
    const monthIndex = date.getMonth();
    const monthName = monthNames[monthIndex];
    
    if (!workoutsByMonth[monthName]) {
      workoutsByMonth[monthName] = [];
    }
    
    workoutsByMonth[monthName].push(workout);
  });
  
  return workoutsByMonth;
} 