/**
 * Unit conversion utilities for workout data
 */

/**
 * Convert weight from kilograms to pounds
 * @param kg Weight in kilograms
 * @returns Weight in pounds
 */
export function kgToLbs(kg: number): number {
  return kg * 2.20462;
}

/**
 * Convert weight from pounds to kilograms
 * @param lbs Weight in pounds
 * @returns Weight in kilograms
 */
export function lbsToKg(lbs: number): number {
  return lbs / 2.20462;
}

/**
 * Convert distance from kilometers to meters
 * @param km Distance in kilometers
 * @returns Distance in meters
 */
export function kmToMeters(km: number): number {
  return km * 1000;
}

/**
 * Convert distance from miles to meters
 * @param miles Distance in miles
 * @returns Distance in meters
 */
export function milesToMeters(miles: number): number {
  return miles * 1609.34;
}

/**
 * Convert distance from meters to kilometers
 * @param meters Distance in meters
 * @returns Distance in kilometers
 */
export function metersToKm(meters: number): number {
  return meters / 1000;
}

/**
 * Convert distance from meters to miles
 * @param meters Distance in meters
 * @returns Distance in miles
 */
export function metersToMiles(meters: number): number {
  return meters / 1609.34;
}

/**
 * Convert time from MM:SS format to seconds
 * @param mmss Time in MM:SS format (e.g., "3:45")
 * @returns Time in seconds
 */
export function mmssToSeconds(mmss: string): number {
  const [minutes, seconds] = mmss.split(':').map(Number);
  return (minutes * 60) + (seconds || 0);
}

/**
 * Convert minutes to seconds
 * @param minutes Time in minutes
 * @returns Time in seconds
 */
export function minutesToSeconds(minutes: number): number {
  return minutes * 60;
}

/**
 * Convert hours to seconds
 * @param hours Time in hours
 * @returns Time in seconds
 */
export function hoursToSeconds(hours: number): number {
  return hours * 3600;
}

/**
 * Convert seconds to MM:SS format
 * @param seconds Time in seconds
 * @returns Time in MM:SS format
 */
export function secondsToMMSS(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
} 