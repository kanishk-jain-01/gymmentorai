import React from 'react';
import { Bar, Chart } from 'react-chartjs-2';
import { ChartData } from 'chart.js';
import { AVAILABLE_METRICS, getMetricLabelWithUnits } from '../chartUtils';
import { useChartOptions } from '../chartUtils';
import { createTooltipCallbacks } from './tooltipCallbacks';
import { formatDuration, formatWeight, formatDistance } from '@/lib/utils';
import { ChartRendererProps, ChartConfig, MixedChartData } from '@/types';
import { useUnitPreferences } from '@/contexts/UnitPreferencesContext';

const ChartRenderer: React.FC<ChartRendererProps> = ({ 
  config, 
  chartData,
  height = 320 
}) => {
  const { getChartOptions } = useChartOptions();
  const { preferences } = useUnitPreferences();
  
  // Check if the chart data has only one data point
  const isSinglePoint = chartData?.labels?.length === 1;
  
  // Get the metric label with appropriate units for y-axis title
  const metricLabel = getMetricLabelWithUnits(config.metric, preferences);
  
  // Get chart options based on the metric
  const chartOptions = getChartOptions(metricLabel, isSinglePoint);
  
  // Customize chart options based on the metric
  if (chartOptions.scales?.y) {
    if (config.metric === 'duration') {
      // Format y-axis ticks for duration in MM:SS format
      chartOptions.scales.y.ticks = {
        ...chartOptions.scales.y.ticks,
        callback: function(value: any) {
          return formatDuration(value);
        }
      };
    } else if (config.metric === 'weight') {
      // Format y-axis ticks for weight with units (but don't convert again)
      chartOptions.scales.y.ticks = {
        ...chartOptions.scales.y.ticks,
        callback: function(value: any) {
          // Just show the numeric value without unit to avoid cluttering the axis
          // The axis title already shows the unit
          return value.toFixed(1);
        }
      };
    } else if (config.metric === 'distance') {
      // Format y-axis ticks for distance with units (but don't convert again)
      chartOptions.scales.y.ticks = {
        ...chartOptions.scales.y.ticks,
        callback: function(value: any) {
          // Just show the numeric value without unit to avoid cluttering the axis
          // The axis title already shows the unit
          return value.toFixed(2);
        }
      };
    } else if (config.metric === 'volume') {
      // Format y-axis ticks for volume with proper decimal precision
      chartOptions.scales.y.ticks = {
        ...chartOptions.scales.y.ticks,
        callback: function(value: any) {
          return value.toFixed(1);
        }
      };
    }
  }
  
  // Create tooltip callbacks with user preferences
  const tooltipCallbacks = createTooltipCallbacks(config, preferences);
  
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