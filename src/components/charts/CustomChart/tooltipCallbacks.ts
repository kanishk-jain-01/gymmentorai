import { ChartConfig, AVAILABLE_METRICS } from '../chartUtils';
import { formatDuration, formatWorkoutDuration } from '@/lib/utils';

export const createTooltipCallbacks = (config: ChartConfig) => {
  return {
    label: function(context: any) {
      const datasetLabel = context.dataset.label || '';
      const value = context.parsed.y;
      
      // Get the metric label for consistent display
      const displayMetric = AVAILABLE_METRICS.find(m => m.value === config.metric)?.label || config.metric;
      
      // Format set duration values as MM:SS
      if (config.metric === 'duration') {
        return `${datasetLabel}: ${formatDuration(value)}`;
      }
      
      // For workout duration, display in minutes
      if (config.metric === 'workoutDuration') {
        return `${datasetLabel}: ${formatWorkoutDuration(value)}`;
      }
      
      // For other metrics, display as is
      return `${datasetLabel}: ${value}`;
    },
    
    title: function(tooltipItems: any[]) {
      // Get the first tooltip item
      const item = tooltipItems[0];
      
      // Check if this is a scatter dataset by checking the label pattern
      if (item.dataset.label?.includes('Sets')) {
        // Extract the date from the dataset label (format: "Date Sets")
        return item.dataset.label.split(' Sets')[0];
      }
      
      // For line points, use the label from the x-axis
      return item.label;
    }
  };
}; 