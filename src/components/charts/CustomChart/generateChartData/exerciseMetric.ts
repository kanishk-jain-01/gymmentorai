import { Workout, ChartConfig, CustomChartData, MixedChartData, ExerciseDataByDate } from '@/types';
import { AVAILABLE_METRICS, CHART_COLORS } from '../../chartUtils';
import { convertWeight, convertDistance } from './converters';
import { generateLineChartData } from './lineChart';
import { generateBarChartData } from './barChart';
import { formatDate } from '@/lib/utils';

// Generate chart data for exercise-specific metrics
export const generateExerciseMetricData = (
  config: ChartConfig,
  workouts: Workout[],
  preferences: { weightUnit: 'lb' | 'kg', distanceUnit: 'mi' | 'km' | 'm' }
): CustomChartData | MixedChartData | null => {
  // Group data by date first
  const exerciseDataByDate: ExerciseDataByDate = {};
  
  // Find all instances of the selected exercise and their sets
  workouts.forEach(workout => {
    // Get date in a simple format without creating a new Date object
    // Since workout.date is already a string, use it directly with formatDate
    const formattedDate = formatDate(workout.date);
    // Create a consistent date key for grouping
    const dateParts = workout.date.toString().split('T')[0].split('-');
    const dateKey = dateParts.length === 3 ? dateParts.join('-') : workout.date; // Ensure YYYY-MM-DD format
    
    workout.exercises.forEach(exercise => {
      if (exercise.name === config.exercise) {
        // Initialize date entry if it doesn't exist
        if (!exerciseDataByDate[dateKey]) {
          exerciseDataByDate[dateKey] = {
            date: workout.date,
            formattedDate,
            sets: []
          };
        }
        
        // Process each set individually
        exercise.sets.forEach((set, setIndex) => {
          // Convert weight and distance to user's preferred units
          const convertedWeight = convertWeight(set.weight, preferences.weightUnit);
          const convertedDistance = convertDistance(set.distance, preferences.distanceUnit);
          
          // Calculate volume if weight and reps are present (use converted weight)
          let volume: number | undefined = undefined;
          if (set.reps && convertedWeight) {
            volume = set.reps * convertedWeight;
          }
          
          exerciseDataByDate[dateKey].sets.push({
            setIndex: setIndex + 1,
            weight: convertedWeight,
            reps: set.reps,
            volume,
            duration: set.duration,
            distance: convertedDistance
          });
        });
      }
    });
  });
  
  // Convert to array and sort by date
  const dateEntries = Object.values(exerciseDataByDate).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  if (dateEntries.length === 0) return null;
  
  // Get metric label
  const metricLabel = AVAILABLE_METRICS.find(m => m.value === config.metric)?.label || config.metric;
  
  // Get color for this chart (cycle through colors)
  const colorIndex = parseInt(config.id) % CHART_COLORS.length;
  const color = CHART_COLORS[colorIndex];
  
  // Check if we have a single date point
  const isSingleDate = dateEntries.length === 1;
  
  if (config.chartType === 'line') {
    return generateLineChartData(config, dateEntries, metricLabel, color, isSingleDate);
  }
  
  if (config.chartType === 'bar') {
    return generateBarChartData(config, dateEntries, metricLabel, color);
  }
  
  return null;
}; 