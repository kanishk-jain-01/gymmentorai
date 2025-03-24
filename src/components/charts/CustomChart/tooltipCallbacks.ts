import { ChartConfig } from '@/types';
import { formatDuration, formatWorkoutDuration, formatPace } from '@/lib/utils';

export const createTooltipCallbacks = (config: ChartConfig, preferences: { weightUnit: 'lb' | 'kg', distanceUnit: 'mi' | 'km' | 'm' }) => {
  // Format a value based on metric type - without applying unit conversions again
  const formatValue = (value: number, metric: string) => {
    if (metric === 'duration') {
      return formatDuration(value);
    }
    if (metric === 'workoutDuration') {
      return formatWorkoutDuration(value);
    }
    if (metric === 'weight') {
      // Don't convert again, just format with units
      return `${value.toFixed(1)} ${preferences.weightUnit === 'lb' ? 'lbs' : 'kg'}`;
    }
    if (metric === 'distance') {
      // Don't convert again, just format with units
      return `${value.toFixed(2)} ${preferences.distanceUnit}`;
    }
    if (metric === 'volume') {
      // Format volume without units, just the number
      return value.toFixed(1);
    }
    if (metric === 'pace') {
      // Format pace as minutes:seconds
      const paceMinutes = Math.floor(value);
      const paceSeconds = Math.round((value - paceMinutes) * 60);
      return `${paceMinutes.toString().padStart(2, '0')}:${paceSeconds.toString().padStart(2, '0')} min/${preferences.distanceUnit === 'mi' ? 'mi' : 'km'}`;
    }
    if (metric === 'reps') {
      // Format reps as an integer
      return Math.round(value).toString();
    }
    return value.toString();
  };
  
  return {
    label: function(context: any) {
      const value = context.parsed.y;
      const chartType = context.chart.config._config.type;
      const datasetLabel = context.dataset.label || '';
      
      // Check if this is an average/total dataset
      const isAverageOrTotal = datasetLabel.includes('Average') || datasetLabel.includes('Total');
      
      // Special handling for volume metric
      if (config.metric === 'volume') {
        if (isAverageOrTotal) {
          return `Total: ${formatValue(value, config.metric)}`;
        } else {
          // For individual set values
          let setIndex = context.dataIndex + 1; // Default fallback
          if (context.dataset.rawData && context.dataset.rawData[context.dataIndex]) {
            setIndex = context.dataset.rawData[context.dataIndex].setIndex || setIndex;
          }
          return `Set ${setIndex}: ${formatValue(value, config.metric)}`;
        }
      }
      
      // Special handling for bar charts - show all set data when hovering
      if (chartType === 'bar' && context.dataset.rawData && context.dataset.rawData[context.dataIndex]) {
        // For bar charts, if we're hovering over average data and have raw data available
        if (isAverageOrTotal) {
          // Check if volume data with new format
          const rawData = context.dataset.rawData[context.dataIndex];
          if (config.metric === 'volume' && rawData && rawData.total !== undefined) {
            return `Total: ${formatValue(rawData.total, config.metric)}`;
          }
          
          const setsData = Array.isArray(rawData) ? rawData : [];
          if (setsData.length === 0) {
            return `${isAverageOrTotal ? 'Average' : 'Total'}: ${formatValue(value, config.metric)}`;
          }
          
          // If we're hovering over a bar, return value for the tooltip header
          // Individual set data will be shown below
          return `${isAverageOrTotal ? 'Average' : 'Total'}: ${formatValue(value, config.metric)}`;
        }
      }
      
      // For line charts and scatter plots
      if (isAverageOrTotal) {
        return `${isAverageOrTotal ? (datasetLabel.includes('Total') ? 'Total' : 'Average') : ''}: ${formatValue(value, config.metric)}`;
      } else {
        // For individual set values
        let setIndex = context.dataIndex + 1; // Default fallback
        
        if (context.dataset.rawData && context.dataset.rawData[context.dataIndex]) {
          setIndex = context.dataset.rawData[context.dataIndex].setIndex || setIndex;
        }
        
        return `Set ${setIndex}: ${formatValue(value, config.metric)}`;
      }
    },
    
    // Generate a callback that handles multiple sets for bar charts
    afterBody: function(context: any) {
      const tooltipItems = context;
      if (tooltipItems.length === 0) return [];
      
      // Get chart type
      const chartType = tooltipItems[0].chart.config._config.type;
      
      // Get raw data from the dataset
      const rawData = tooltipItems[0].dataset.rawData?.[tooltipItems[0].dataIndex];
      if (!rawData) return [];
      
      // For volume metric in any chart type, show set details
      if (config.metric === 'volume') {
        if (rawData.sets && Array.isArray(rawData.sets)) {
          // Return each set's contribution to the total
          return rawData.sets.map(item => 
            `Set ${item.setIndex}: ${formatValue(item.value, config.metric)}`
          );
        }
        return [];
      }
      
      // For other metrics, only show set details in bar charts 
      if (chartType !== 'bar') return [];
      
      // For other metrics with array of set data
      if (Array.isArray(rawData) && rawData.length > 0) {
        // Generate list of all sets for this date
        return rawData.map(item => 
          `Set ${item.setIndex}: ${formatValue(item.value, config.metric)}`
        );
      }
      
      return [];
    },
    
    title: function(tooltipItems: any[]) {
      // Return empty string to hide the date
      return '';
    }
  };
}; 