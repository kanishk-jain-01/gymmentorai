/**
 * Utility functions for the application
 */

import { metersToKm, metersToMiles } from './unit-converter';

// Export unit conversion utilities
export * from './unit-converter';

// Export email utilities
export * from './email-utils';

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

/**
 * Formats a date in simple MM/DD/YYYY format
 * @param date Date object or ISO date string in format YYYY-MM-DDThh:mm:ss.sssZ
 * @returns Formatted date string (MM/DD/YYYY)
 */
export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    // Handle string input as before
    // Extract date part before the "T"
    const datePart = date.split('T')[0];
    // Split into year, month, day
    const [year, month, day] = datePart.split('-').map(Number);
    return `${month}/${day}/${year}`;
  } else {
    // Handle Date object
    const month = date.getMonth() + 1; // getMonth() is zero-based
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }
}

/**
 * Formats pace (minutes per distance unit) based on duration and distance
 * @param duration Duration in seconds
 * @param distance Distance in meters
 * @param unit Target unit ('mi' or 'km')
 * @returns Formatted pace string in MM:SS format per unit
 */
export function formatPace(duration?: number, distance?: number, unit: 'mi' | 'km' = 'km'): string {
  if (!duration || !distance || distance === 0) return '-';
  
  // Convert duration from seconds to minutes
  const durationInMinutes = duration / 60;
  
  // Calculate pace based on the unit
  let paceInMinutesPerUnit;
  if (unit === 'mi') {
    // Convert meters to miles then calculate pace
    const distanceInMiles = metersToMiles(distance);
    paceInMinutesPerUnit = durationInMinutes / distanceInMiles;
  } else {
    // Convert meters to km then calculate pace
    const distanceInKm = metersToKm(distance);
    paceInMinutesPerUnit = durationInMinutes / distanceInKm;
  }
  
  // Convert pace to MM:SS format
  const paceMinutes = Math.floor(paceInMinutesPerUnit);
  const paceSeconds = Math.round((paceInMinutesPerUnit - paceMinutes) * 60);
  
  return `${paceMinutes.toString().padStart(2, '0')}:${paceSeconds.toString().padStart(2, '0')}`;
}