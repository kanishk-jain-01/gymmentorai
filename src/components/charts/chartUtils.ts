import { Workout } from '@/types';
import { useTheme } from 'next-themes';

// Define the UnitPreferences type that matches the context
type UnitPreferences = {
  weightUnit: 'lb' | 'kg';
  distanceUnit: 'mi' | 'km' | 'm';
};

// Date range options
export const DATE_RANGES = [
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 3 months', value: 90 },
  { label: 'Last 6 months', value: 180 },
  { label: '1 year', value: 365 },
  { label: 'All time', value: 0 },
  { label: 'Custom range', value: -1 }
];

// Chart type options
export const CHART_TYPES = [
  { label: 'Line', value: 'line' },
  { label: 'Bar', value: 'bar' },
];

// Available metrics for y-axis (static version for type references)
export const AVAILABLE_METRICS = [
  { label: 'Weight', value: 'weight' },
  { label: 'Volume (reps × weight)', value: 'volume' },
  { label: 'Total Workout Time (minutes)', value: 'workoutDuration' },
  { label: 'Set Time (mm:ss)', value: 'duration' },
  { label: 'Distance', value: 'distance' },
  { label: 'Pace', value: 'pace' },
];

// Function to get metrics with appropriate unit labels based on user preferences
export const getMetricsWithUnits = (preferences: UnitPreferences) => [
  { label: `Weight (${preferences.weightUnit === 'lb' ? 'lbs' : 'kg'})`, value: 'weight' },
  { label: `Volume (reps × weight)`, value: 'volume' },
  { label: 'Total Workout Time (minutes)', value: 'workoutDuration' },
  { label: 'Set Time (mm:ss)', value: 'duration' },
  { label: `Distance (${preferences.distanceUnit})`, value: 'distance' },
  { label: `Pace (min/${preferences.distanceUnit === 'mi' ? 'mi' : 'km'})`, value: 'pace' },
];

// Get metric label with units
export const getMetricLabelWithUnits = (metric: string, preferences: UnitPreferences): string => {
  const metrics = getMetricsWithUnits(preferences);
  return metrics.find(m => m.value === metric)?.label || metric;
};

// Chart colors
export const CHART_COLORS = [
  { border: 'rgb(75, 192, 192)', background: 'rgba(75, 192, 192, 0.5)' },
  { border: 'rgb(153, 102, 255)', background: 'rgba(153, 102, 255, 0.5)' },
  { border: 'rgb(255, 99, 132)', background: 'rgba(255, 99, 132, 0.5)' },
  { border: 'rgb(54, 162, 235)', background: 'rgba(54, 162, 235, 0.5)' },
  { border: 'rgb(255, 159, 64)', background: 'rgba(255, 159, 64, 0.5)' },
];

// Filter workouts by date range
export const filterWorkoutsByDateRange = (
  workouts: Workout[], 
  dateRange: number, 
  customStartDate?: string, 
  customEndDate?: string
): Workout[] => {
  if (workouts.length === 0) return [];
  
  // Handle custom date range
  if (dateRange === -1 && customStartDate && customEndDate) {
    const startDate = new Date(customStartDate);
    const endDate = new Date(customEndDate);
    endDate.setHours(23, 59, 59, 999); // Set to end of day
    
    return workouts.filter(workout => {
      const workoutDate = new Date(workout.date);
      return workoutDate >= startDate && workoutDate <= endDate;
    });
  }
  
  // Handle predefined date ranges
  if (dateRange === 0) {
    // All time
    return workouts;
  } else {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - dateRange);
    
    return workouts.filter(workout => {
      const workoutDate = new Date(workout.date);
      return workoutDate >= cutoffDate;
    });
  }
};

// Create a hook for chart options based on theme
export const useChartOptions = () => {
  const { theme } = useTheme();
  
  const getChartOptions = (yAxisTitle: string, isSinglePoint: boolean = false) => {
    const isDark = theme === 'dark';
    const textColor = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    // Base options that work for both single and multiple data points
    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: yAxisTitle,
            color: textColor
          },
          grid: {
            color: gridColor
          },
          ticks: {
            color: textColor,
            // Add a placeholder callback that can be overridden
            callback: function(value: any) {
              return value;
            }
          }
        },
        x: {
          title: {
            display: true,
            text: 'Date',
            color: textColor
          },
          grid: {
            color: gridColor
          },
          ticks: {
            color: textColor
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += context.parsed.y;
              }
              return label;
            }
          }
        }
      }
    };
  };
  
  return { getChartOptions };
}; 