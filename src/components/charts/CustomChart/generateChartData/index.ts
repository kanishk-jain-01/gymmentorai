import { ChartConfig, Workout, CustomChartData, MixedChartData } from '@/types';
import { filterWorkoutsByDateRange } from '../../chartUtils';
import { generateWorkoutDurationData } from './workoutDuration';
import { generateExerciseMetricData } from './exerciseMetric';

// Generate chart data based on configuration
export const generateChartData = (
  config: ChartConfig,
  workouts: Workout[],
  preferences: { weightUnit: 'lb' | 'kg', distanceUnit: 'mi' | 'km' | 'm' }
): CustomChartData | MixedChartData | null => {
  if (!config.exercise && config.metric !== 'workoutDuration') return null;
  if (workouts.length === 0) return null;
  
  // Get workouts filtered by this chart's date range
  const chartFilteredWorkouts = filterWorkoutsByDateRange(
    workouts, 
    config.dateRange, 
    config.customStartDate, 
    config.customEndDate
  );
  
  // Special case for workout duration (not tied to a specific exercise)
  if (config.metric === 'workoutDuration') {
    return generateWorkoutDurationData(config, chartFilteredWorkouts, preferences);
  }
  
  // For exercise-specific metrics (including set duration)
  return generateExerciseMetricData(config, chartFilteredWorkouts, preferences);
}; 