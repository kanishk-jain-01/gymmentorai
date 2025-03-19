import { lbsToKg, metersToKm, metersToMiles } from '@/lib/utils';

// Helper function to convert weight based on user preferences
export const convertWeight = (weight: number | undefined, unit: 'lb' | 'kg'): number | undefined => {
  if (weight === undefined) return undefined;
  return unit === 'kg' ? lbsToKg(weight) : weight;
};

// Helper function to convert distance based on user preferences
export const convertDistance = (distance: number | undefined, unit: 'mi' | 'km' | 'm'): number | undefined => {
  if (distance === undefined) return undefined;
  if (unit === 'km') return metersToKm(distance);
  if (unit === 'mi') return metersToMiles(distance);
  return distance; // Already in meters
}; 