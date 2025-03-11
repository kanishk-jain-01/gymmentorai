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