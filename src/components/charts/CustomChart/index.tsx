import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import ChartConfig from '../ChartConfig';
import ChartRenderer from './ChartRenderer';
import { generateChartData } from './generateChartData';
import { CustomChartProps } from '@/types';

const CustomChart: React.FC<CustomChartProps> = ({
  config,
  workouts,
  exerciseOptions,
  personalRecords,
  onUpdateConfig,
  onRemoveChart
}) => {
  // Generate chart data and handle errors
  let chartData;
  try {
    chartData = generateChartData(config, workouts);
  } catch (error) {
    console.error('Error generating chart data:', error);
    chartData = null;
  }

  return (
    <div className="bg-theme-card shadow sm:rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex-1">
            <input
              type="text"
              value={config.title}
              onChange={(e) => onUpdateConfig(config.id, 'title', e.target.value)}
              className="text-lg font-medium text-theme-fg bg-transparent border-b border-transparent hover:border-theme-border focus:outline-none focus:border-indigo-500 w-full"
            />
          </div>
          <button
            onClick={() => onRemoveChart(config.id)}
            className="text-theme-fg opacity-50 hover:text-theme-fg hover:opacity-100"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        
        <ChartConfig 
          config={config}
          exerciseOptions={exerciseOptions}
          onUpdateConfig={(field, value) => onUpdateConfig(config.id, field, value)}
        />
        
        {config.exercise && personalRecords[config.exercise] && config.metric === 'weight' && (
          <div className="mb-4 p-3 bg-theme-accent bg-indigo-50 rounded-md">
            <p className="text-sm font-medium text-theme-fg">
              Personal Record: {personalRecords[config.exercise].weight} lbs on {new Date(personalRecords[config.exercise].date).toLocaleDateString()}
            </p>
          </div>
        )}
        
        {/* Chart */}
        {chartData ? (
          <div className="h-80">
            <ChartRenderer config={config} chartData={chartData} />
          </div>
        ) : (
          <p className="text-theme-fg opacity-70 text-center py-10">
            No data available for this configuration.
          </p>
        )}
      </div>
    </div>
  );
};

export default CustomChart; 