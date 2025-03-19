import { ChartConfig, CustomChartData, ExerciseDataByDate } from '@/types';

// Generate bar chart data for exercise metrics
export const generateBarChartData = (
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