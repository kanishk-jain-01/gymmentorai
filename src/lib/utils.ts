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