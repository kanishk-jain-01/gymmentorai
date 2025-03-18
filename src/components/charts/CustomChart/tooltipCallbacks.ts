import { ChartConfig } from '@/types';
import { getMetricLabelWithUnits } from '../chartUtils';
import { formatDuration, formatWorkoutDuration } from '@/lib/utils';

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
      const unit = preferences.weightUnit === 'lb' ? 'lbs' : 'kg';
      return `${value.toFixed(1)} ${unit}`;
    }
    return value.toString();
  };
  
  return {
    label: function(context: any) {
      const value = context.parsed.y;
      const chartType = context.chart.config._config.type;
      
      // Check if this is an average dataset
      const isAverage = context.dataset.label && context.dataset.label.includes('Average');
      
      // Special handling for bar charts - show all set data when hovering
      if (chartType === 'bar' && context.dataset.rawData && context.dataset.rawData[context.dataIndex]) {
        // For bar charts, if we're hovering over average data and have raw data available
        // First show the average line
        if (isAverage) {
          const setsData = context.dataset.rawData[context.dataIndex] || [];
          if (setsData.length === 0) {
            return `Average: ${formatValue(value, config.metric)}`;
          }
          
          // If we're hovering over a bar, return null here so that 
          // individual set data lines will be shown below
          return `Average: ${formatValue(value, config.metric)}`;
        }
      }
      
      // For line charts and scatter plots
      if (isAverage) {
        return `Average: ${formatValue(value, config.metric)}`;
      } else {
        // For individual set values
        // Try to get the set index from rawData if available
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
      
      // Only do this for bar charts
      const chartType = tooltipItems[0].chart.config._config.type;
      if (chartType !== 'bar') return [];
      
      // Get raw data from the dataset
      const rawData = tooltipItems[0].dataset.rawData?.[tooltipItems[0].dataIndex];
      if (!rawData || !Array.isArray(rawData) || rawData.length === 0) return [];
      
      // Generate list of all sets for this date
      return rawData.map(item => 
        `Set ${item.setIndex}: ${formatValue(item.value, config.metric)}`
      );
    },
    
    title: function(tooltipItems: any[]) {
      // Get the first tooltip item
      const item = tooltipItems[0];
      
      // Return the date from the label
      return item.label;
    }
  };
}; 