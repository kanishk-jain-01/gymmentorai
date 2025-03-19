import { Workout, ChartConfig, CustomChartData, WorkoutDurationsByDate } from '@/types';
import { AVAILABLE_METRICS, CHART_COLORS } from '../../chartUtils';

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
      const workoutDate = new Date(workout.date);
      const dateKey = workoutDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      const formattedDate = workoutDate.toLocaleDateString();
      
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