import { ChartConfig, MixedChartData, ExerciseDataByDate } from '@/types';

// Generate line chart data for exercise metrics
export const generateLineChartData = (
  config: ChartConfig,
  dateEntries: ExerciseDataByDate[string][],
  metricLabel: string,
  color: { border: string, background: string },
  isSingleDate: boolean
): MixedChartData => {
  // Calculate values for each day for the line
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
  
  // For Volume metric, only use line chart (no scatter points)
  if (config.metric === 'volume') {
    // For volume, we'll store the total and each set's contribution for tooltips
    const rawDataByDate = dateEntries.map(entry => {
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
    });
    
    const labels = dateEntries.map(entry => entry.formattedDate);
    
    // Adjust line settings based on number of data points
    // For single point or just a few points, don't use tension/curve
    const useTension = values.length > 2;
    
    // Main dataset array with the filled line chart
    const datasets: any[] = [
      {
        type: 'line' as const,
        label: `${metricLabel} (Total)`,
        data: values,
        borderColor: color.border,
        backgroundColor: color.background,
        borderWidth: 2,
        tension: useTension ? 0.3 : 0, // Use 0 tension (straight lines) for few points
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 5,
        // Handle possible missing points by not drawing line segments there
        spanGaps: true,
        // Store raw data for tooltips
        rawData: rawDataByDate
      } as any
    ];
    
    return {
      labels,
      datasets
    };
  }
  
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
      data: values,
      borderColor: color.border,
      backgroundColor: 'transparent',
      borderWidth: 2,
      // Adjust tension based on number of data points
      tension: values.length > 2 ? 0.1 : 0,
      fill: false,
      spanGaps: true,
      pointRadius: 0, // Hide points on the line
    }
  ];
  
  // Add scatter datasets - one for each date (except for volume metric)
  if (config.metric !== 'volume') {
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
  }
  
  return {
    labels,
    datasets
  };
}; 