import React from 'react';
import { Bar, Chart } from 'react-chartjs-2';
import { ChartData } from 'chart.js';
import { AVAILABLE_METRICS } from '../chartUtils';
import { useChartOptions } from '../chartUtils';
import { createTooltipCallbacks } from './tooltipCallbacks';
import { formatDuration } from '@/lib/utils';
import { ChartRendererProps, ChartConfig, MixedChartData } from '@/types';

const ChartRenderer: React.FC<ChartRendererProps> = ({ 
  config, 
  chartData,
  height = 320 
}) => {
  const { getChartOptions } = useChartOptions();
  
  // Check if the chart data has only one data point
  const isSinglePoint = chartData?.labels?.length === 1;
  
  // Get the metric label for y-axis title
  const metricLabel = AVAILABLE_METRICS.find(m => m.value === config.metric)?.label || config.metric;
  
  // Get chart options based on the metric
  const chartOptions = getChartOptions(metricLabel, isSinglePoint);
  
  // Customize chart options based on the metric
  if (config.metric === 'duration') {
    // Format y-axis ticks for duration in MM:SS format
    if (chartOptions.scales?.y) {
      chartOptions.scales.y.ticks = {
        ...chartOptions.scales.y.ticks,
        callback: function(value: any) {
          return formatDuration(value);
        }
      };
    }
  }
  
  // Create tooltip callbacks
  const tooltipCallbacks = createTooltipCallbacks(config);
  
  if (config.chartType === 'line') {
    return (
      <Chart 
        type="line"
        height={height}
        options={{
          ...chartOptions,
          plugins: {
            ...chartOptions.plugins,
            legend: {
              display: false
            },
            tooltip: {
              ...chartOptions.plugins?.tooltip,
              callbacks: tooltipCallbacks
            }
          },
          scales: {
            ...chartOptions.scales,
            x: {
              ...chartOptions.scales?.x,
              type: 'category',
              ticks: {
                ...chartOptions.scales?.x?.ticks,
                autoSkip: true,
                maxRotation: 45,
                minRotation: 0
              },
              offset: true
            }
          },
          interaction: {
            mode: 'nearest',
            intersect: false
          }
        }} 
        data={chartData} 
      />
    );
  } 
  
  return (
    <Bar 
      height={height}
      options={{
        ...chartOptions,
        plugins: {
          ...chartOptions.plugins,
          tooltip: {
            ...chartOptions.plugins?.tooltip,
            callbacks: tooltipCallbacks
          }
        }
      }}
      data={chartData as ChartData<'bar', number[], string>} 
    />
  );
};

export default ChartRenderer; 