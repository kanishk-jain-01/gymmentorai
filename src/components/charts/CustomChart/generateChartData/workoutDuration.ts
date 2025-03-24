import { Workout, ChartConfig, CustomChartData } from '@/types';
import { AVAILABLE_METRICS, CHART_COLORS } from '../../chartUtils';
import { formatDate } from '@/lib/utils';

interface WorkoutDurationsByDate {
  [dateKey: string]: {
    date: string;
    formattedDate: string;
    duration: number;
  }[];
}

// Generate chart data for workout duration metric
export const generateWorkoutDurationData = (
  config: ChartConfig,
  workouts: Workout[],
  preferences: { weightUnit: 'lb' | 'kg', distanceUnit: 'mi' | 'km' | 'm' }
): CustomChartData | null => {
  // Group workout durations by date
  const workoutDurationsByDate: WorkoutDurationsByDate = {};
  
  workouts.forEach(workout => {
    if (workout.duration) {
      // Get date in a simple format without creating a new Date object
      // Since workout.date is already a string, use it directly
      const formattedDate = formatDate(workout.date);
      // Create a consistent date key for grouping
      const dateParts = workout.date.toString().split('T')[0].split('-');
      const dateKey = dateParts.length === 3 ? dateParts.join('-') : workout.date; // Ensure YYYY-MM-DD format
      
      if (!workoutDurationsByDate[dateKey]) {
        workoutDurationsByDate[dateKey] = [];
      }
      
      workoutDurationsByDate[dateKey].push({
        date: workout.date,
        formattedDate,
        duration: workout.duration
      });
    }
  });
  
  // Convert to array and sort by date
  const dateKeys = Object.keys(workoutDurationsByDate).sort();
  if (dateKeys.length === 0) return null;
  
  const labels = dateKeys.map(dateKey => {
    // Use the first workout's formatted date for this date
    return workoutDurationsByDate[dateKey][0].formattedDate;
  });
  
  // Calculate average workout duration for each date
  const averageDurations = dateKeys.map(dateKey => {
    const durations = workoutDurationsByDate[dateKey].map(w => w.duration);
    return durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
  });
  
  // Get color for this chart
  const colorIndex = parseInt(config.id) % CHART_COLORS.length;
  const color = CHART_COLORS[colorIndex];
  
  // Return chart data for workout durations
  return {
    labels,
    datasets: [
      {
        label: AVAILABLE_METRICS.find(m => m.value === 'workoutDuration')?.label || 'Workout Duration',
        data: averageDurations,
        borderColor: color.border,
        backgroundColor: color.background,
        borderWidth: 2,
      },
    ],
  };
}; 