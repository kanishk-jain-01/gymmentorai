import { ChartData } from 'chart.js';
import { 
  Workout, 
  ChartConfig, 
  CustomChartData, 
  MixedChartData, 
  ExerciseDataByDate, 
  WorkoutDurationsByDate 
} from '@/types';
import { 
  AVAILABLE_METRICS, 
  CHART_COLORS,
  filterWorkoutsByDateRange
} from '../chartUtils';
import { lbsToKg, metersToKm, metersToMiles } from '@/lib/utils';

// Helper function to convert weight based on user preferences
const convertWeight = (weight: number | undefined, unit: 'lb' | 'kg'): number | undefined => {
  if (weight === undefined) return undefined;
  return unit === 'kg' ? lbsToKg(weight) : weight;
};

// Helper function to convert distance based on user preferences
const convertDistance = (distance: number | undefined, unit: 'mi' | 'km' | 'm'): number | undefined => {
  if (distance === undefined) return undefined;
  if (unit === 'km') return metersToKm(distance);
  if (unit === 'mi') return metersToMiles(distance);
  return distance; // Already in meters
};

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

// Generate chart data for workout duration metric
const generateWorkoutDurationData = (
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

// Generate chart data for exercise-specific metrics
const generateExerciseMetricData = (
  config: ChartConfig,
  workouts: Workout[],
  preferences: { weightUnit: 'lb' | 'kg', distanceUnit: 'mi' | 'km' | 'm' }
): CustomChartData | MixedChartData | null => {
  // Group data by date first
  const exerciseDataByDate: ExerciseDataByDate = {};
  
  // Find all instances of the selected exercise and their sets
  workouts.forEach(workout => {
    const workoutDate = new Date(workout.date);
    const dateKey = workoutDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    const formattedDate = workoutDate.toLocaleDateString();
    
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

// Generate line chart data for exercise metrics
const generateLineChartData = (
  config: ChartConfig,
  dateEntries: ExerciseDataByDate[string][],
  metricLabel: string,
  color: { border: string, background: string },
  isSingleDate: boolean
): MixedChartData => {
  // Calculate average values for each day for the line
  const averageValues = dateEntries.map(entry => {
    const validValues = entry.sets
      .map(set => set[config.metric])
      .filter(val => val !== undefined && val !== null) as number[];
    
    return validValues.length > 0
      ? validValues.reduce((sum, val) => sum + val, 0) / validValues.length
      : 0;
  });
  
  // For a single date with multiple sets, use a scatter chart
  if (isSingleDate) {
    // Create data points for individual sets
    const singleDateData = dateEntries[0].sets.map(set => {
      const value = set[config.metric];
      return value !== undefined && value !== null ? {
        x: 0, // Use same x-coordinate (0) for all points to stack them vertically
        y: value
      } : null;
    }).filter(point => point !== null);
    
    // Create raw data with set indices for tooltips
    const rawData = dateEntries[0].sets
      .map((set, index) => ({
        setIndex: set.setIndex,
        value: set[config.metric]
      }))
      .filter(item => item.value !== undefined && item.value !== null);
    
    return {
      labels: [dateEntries[0].formattedDate], // Single date label
      datasets: [
        {
          type: 'scatter' as const,
          label: metricLabel,
          data: singleDateData,
          backgroundColor: color.background,
          borderColor: color.border,
          pointRadius: 5,
          pointHoverRadius: 7,
          // Use type assertion to avoid TypeScript error with custom property
          rawData: rawData
        } as any
      ],
    };
  }
  
  // For multiple dates, create a hybrid chart
  const labels = dateEntries.map(entry => entry.formattedDate);
  
  // Create an array of arrays, where each inner array contains all values for a specific date
  const valuesByDate: number[][] = dateEntries.map(entry => 
    entry.sets
      .map(set => set[config.metric])
      .filter(val => val !== undefined && val !== null) as number[]
  );
  
  // Store raw data with set indices for tooltip access
  const rawDataByDate = dateEntries.map(entry => 
    entry.sets
      .filter(set => set[config.metric] !== undefined && set[config.metric] !== null)
      .map(set => ({
        setIndex: set.setIndex,
        value: set[config.metric]
      }))
  );
  
  // Create datasets: one line for averages and multiple scatter datasets (one per date)
  const datasets: any[] = [
    {
      type: 'line' as const,
      label: `${metricLabel} (Average)`,
      data: averageValues,
      borderColor: color.border,
      backgroundColor: 'transparent',
      borderWidth: 2,
      tension: 0,
      fill: false,
      pointRadius: 0, // Hide points on the line
    }
  ];
  
  // Add scatter datasets - one for each date
  valuesByDate.forEach((values, dateIndex) => {
    if (values.length > 0) {
      // Create a scatter dataset that places all points at the same x position (dateIndex)
      const scatterData = values.map(value => ({
        x: labels[dateIndex],
        y: value
      }));
      
      datasets.push({
        type: 'scatter' as const,
        label: labels[dateIndex],
        data: scatterData,
        backgroundColor: color.background,
        borderColor: color.border,
        pointRadius: 5,
        pointHoverRadius: 7,
        showLine: false,
        // Use type assertion to avoid TypeScript error with custom property
        rawData: rawDataByDate[dateIndex]
      } as any);
    }
  });
  
  return {
    labels,
    datasets
  };
};

// Generate bar chart data for exercise metrics
const generateBarChartData = (
  config: ChartConfig,
  dateEntries: ExerciseDataByDate[string][],
  metricLabel: string,
  color: { border: string, background: string }
): CustomChartData => {
  // Calculate average values for each day
  const averageValues = dateEntries.map(entry => {
    const validValues = entry.sets
      .map(set => set[config.metric])
      .filter(val => val !== undefined && val !== null) as number[];
    
    return validValues.length > 0
      ? validValues.reduce((sum, val) => sum + val, 0) / validValues.length
      : 0;
  });
  
  // Create raw data for tooltips with set indices
  const rawDataByDate = dateEntries.map(entry => 
    entry.sets
      .filter(set => set[config.metric] !== undefined && set[config.metric] !== null)
      .map(set => ({
        setIndex: set.setIndex,
        value: set[config.metric]
      }))
  );
  
  return {
    labels: dateEntries.map(entry => entry.formattedDate),
    datasets: [
      {
        label: `${metricLabel} (Average)`,
        data: averageValues,
        borderColor: color.border,
        backgroundColor: color.background,
        borderWidth: 2,
        // Use type assertion to avoid TypeScript error with custom property
        rawData: rawDataByDate
      } as any,
    ],
  };
}; 