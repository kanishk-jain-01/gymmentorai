import { ChartConfig, CustomChartData, ExerciseDataByDate } from '@/types';

// Generate bar chart data for exercise metrics
export const generateBarChartData = (
  config: ChartConfig,
  dateEntries: ExerciseDataByDate[string][],
  metricLabel: string,
  color: { border: string, background: string }
): CustomChartData => {
  // Calculate values for each day
  const values = dateEntries.map(entry => {
    // For volume, use the daily total instead of averaging set values
    if (config.metric === 'volume' && entry.dailyVolumeTotal !== undefined) {
      return entry.dailyVolumeTotal;
    }
    
    // For other metrics, calculate the average
    const validValues = entry.sets
      .map(set => set[config.metric])
      .filter(val => val !== undefined && val !== null) as number[];
    
    return validValues.length > 0
      ? validValues.reduce((sum, val) => sum + val, 0) / validValues.length
      : 0;
  });
  
  // Create raw data for tooltips
  const rawDataByDate = dateEntries.map(entry => {
    if (config.metric === 'volume') {
      // For volume, include the total and each set's contribution
      const setData = entry.sets
        .filter(set => set.volume !== undefined && set.volume !== null)
        .map(set => ({
          setIndex: set.setIndex,
          value: set.volume as number
        }));
      
      return {
        total: entry.dailyVolumeTotal,
        sets: setData
      };
    } else {
      // For other metrics, just include individual set data
      return entry.sets
        .filter(set => set[config.metric] !== undefined && set[config.metric] !== null)
        .map(set => ({
          setIndex: set.setIndex,
          value: set[config.metric]
        }));
    }
  });
  
  const label = config.metric === 'volume' ? `${metricLabel} (Total)` : `${metricLabel} (Average)`;
  
  return {
    labels: dateEntries.map(entry => entry.formattedDate),
    datasets: [
      {
        label,
        data: values,
        borderColor: color.border,
        backgroundColor: color.background,
        borderWidth: 2,
        // Use type assertion to avoid TypeScript error with custom property
        rawData: rawDataByDate
      } as any,
    ],
  };
}; 