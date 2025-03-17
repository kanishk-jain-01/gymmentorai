/**
 * Unit conversion utilities for weight and distance
 */

// Weight conversions
export function lbToKg(lb: number): number {
  return lb * 0.45359237;
}

export function kgToLb(kg: number): number {
  return kg * 2.20462262;
}

// Distance conversions
export function metersToMiles(meters: number): number {
  return meters * 0.000621371;
}

export function metersToKm(meters: number): number {
  return meters / 1000;
}

export function milesToMeters(miles: number): number {
  return miles * 1609.34;
}

export function kmToMeters(km: number): number {
  return km * 1000;
}

/**
 * Format weight based on unit preference
 * @param weight Weight in pounds (lb)
 * @param unit Target unit ('lb' or 'kg')
 * @returns Formatted weight string with unit
 */
export function formatWeight(weight?: number | null, unit: 'lb' | 'kg' = 'lb'): string {
  if (weight === undefined || weight === null) return '-';
  
  if (unit === 'kg') {
    const weightInKg = lbToKg(weight);
    return `${weightInKg.toFixed(1)} kg`;
  }
  
  return `${weight.toFixed(1)} lbs`;
}

/**
 * Format distance based on unit preference
 * @param distance Distance in meters
 * @param unit Target unit ('mi', 'km', or 'm')
 * @returns Formatted distance string with unit
 */
export function formatDistance(distance?: number | null, unit: 'mi' | 'km' | 'm' = 'm'): string {
  if (distance === undefined || distance === null) return '-';
  
  switch (unit) {
    case 'mi':
      const distanceInMiles = metersToMiles(distance);
      return `${distanceInMiles.toFixed(2)} mi`;
    case 'km':
      const distanceInKm = metersToKm(distance);
      return `${distanceInKm.toFixed(2)} km`;
    default:
      return `${Math.round(distance)} m`;
  }
} 