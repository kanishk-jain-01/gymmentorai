import React, { useEffect } from 'react';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { ChartConfig as ChartConfigType, DATE_RANGES, CHART_TYPES, AVAILABLE_METRICS } from './chartUtils';

interface ChartConfigProps {
  config: ChartConfigType;
  exerciseOptions: string[];
  onUpdateConfig: (field: keyof ChartConfigType, value: any) => void;
}

const ChartConfig: React.FC<ChartConfigProps> = ({ 
  config, 
  exerciseOptions, 
  onUpdateConfig 
}) => {
  // When switching to workout duration, clear the exercise selection
  useEffect(() => {
    if (config.metric === 'workoutDuration' && config.exercise) {
      onUpdateConfig('exercise', null);
    }
  }, [config.metric]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {/* Only show exercise selector if not using workout duration metric */}
        {config.metric !== 'workoutDuration' && (
          <div>
            <label htmlFor={`exercise-${config.id}`} className="block text-sm font-medium text-theme-fg">
              Exercise
            </label>
            <select
              id={`exercise-${config.id}`}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-theme-border focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-theme-card text-theme-fg"
              value={config.exercise || ''}
              onChange={(e) => onUpdateConfig('exercise', e.target.value)}
            >
              {exerciseOptions.map(exercise => (
                <option key={exercise} value={exercise}>{exercise}</option>
              ))}
            </select>
          </div>
        )}
        
        <div className={config.metric === 'workoutDuration' ? 'md:col-span-2' : ''}>
          <label htmlFor={`metric-${config.id}`} className="block text-sm font-medium text-theme-fg">
            Y-Axis Metric
          </label>
          <select
            id={`metric-${config.id}`}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-theme-border focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-theme-card text-theme-fg"
            value={config.metric}
            onChange={(e) => onUpdateConfig('metric', e.target.value)}
          >
            {AVAILABLE_METRICS.map(metric => (
              <option key={metric.value} value={metric.value}>{metric.label}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor={`chart-type-${config.id}`} className="block text-sm font-medium text-theme-fg">
            Chart Type
          </label>
          <select
            id={`chart-type-${config.id}`}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-theme-border focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-theme-card text-theme-fg"
            value={config.chartType}
            onChange={(e) => onUpdateConfig('chartType', e.target.value as 'line' | 'bar')}
          >
            {CHART_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor={`date-range-${config.id}`} className="block text-sm font-medium text-theme-fg">
            Date Range
          </label>
          <select
            id={`date-range-${config.id}`}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-theme-border focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-theme-card text-theme-fg"
            value={config.dateRange}
            onChange={(e) => onUpdateConfig('dateRange', parseInt(e.target.value))}
          >
            {DATE_RANGES.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Custom Date Range Inputs (shown only when custom range is selected) */}
      {config.dateRange === -1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-3 bg-theme-bg rounded-md">
          <div className="flex items-center">
            <CalendarIcon className="h-5 w-5 text-theme-fg opacity-50 mr-2" />
            <div>
              <label htmlFor={`start-date-${config.id}`} className="block text-sm font-medium text-theme-fg">
                Start Date
              </label>
              <input
                type="date"
                id={`start-date-${config.id}`}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-theme-border focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-theme-card text-theme-fg"
                value={config.customStartDate || ''}
                onChange={(e) => onUpdateConfig('customStartDate', e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center">
            <CalendarIcon className="h-5 w-5 text-theme-fg opacity-50 mr-2" />
            <div>
              <label htmlFor={`end-date-${config.id}`} className="block text-sm font-medium text-theme-fg">
                End Date
              </label>
              <input
                type="date"
                id={`end-date-${config.id}`}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-theme-border focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-theme-card text-theme-fg"
                value={config.customEndDate || ''}
                onChange={(e) => onUpdateConfig('customEndDate', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChartConfig; 