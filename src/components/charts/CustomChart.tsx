import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { ChartData } from 'chart.js';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Workout, Exercise } from '@/types';
import { 
  ChartConfig as ChartConfigType, 
  CustomChartData, 
  AVAILABLE_METRICS, 
  CHART_COLORS,
  filterWorkoutsByDateRange,
  useChartOptions
} from './chartUtils';
import ChartConfig from './ChartConfig';

interface CustomChartProps {
  config: ChartConfigType;
  workouts: Workout[];
  exerciseOptions: string[];
  personalRecords: Record<string, { weight: number, date: string }>;
  onUpdateConfig: (id: string, field: keyof ChartConfigType, value: any) => void;
  onRemoveChart: (id: string) => void;
}

const CustomChart: React.FC<CustomChartProps> = ({
  config,
  workouts,
  exerciseOptions,
  personalRecords,
  onUpdateConfig,
  onRemoveChart
}) => {
  const { getChartOptions } = useChartOptions();
  
  // Generate chart data based on configuration
  const generateChartData = (): CustomChartData | null => {
    if (!config.exercise || workouts.length === 0) return null;
    
    // Get workouts filtered by this chart's date range
    const chartFilteredWorkouts = filterWorkoutsByDateRange(
      workouts, 
      config.dateRange, 
      config.customStartDate, 
      config.customEndDate
    );
    
    // Find all instances of the selected exercise
    const exerciseData: { date: string; [key: string]: any }[] = [];
    
    chartFilteredWorkouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        if (exercise.name === config.exercise) {
          // Calculate volume if all values are present
          let volume: number | undefined = undefined;
          if (exercise.sets && exercise.reps && exercise.weight) {
            volume = exercise.sets * exercise.reps * exercise.weight;
          }
          
          exerciseData.push({
            date: workout.date,
            weight: exercise.weight,
            reps: exercise.reps,
            sets: exercise.sets,
            volume,
            duration: exercise.duration,
            distance: exercise.distance
          });
        }
      });
    });
    
    // Sort by date
    exerciseData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (exerciseData.length === 0) return null;
    
    // Get metric label
    const metricLabel = AVAILABLE_METRICS.find(m => m.value === config.metric)?.label || config.metric;
    
    // Get color for this chart (cycle through colors)
    const colorIndex = parseInt(config.id) % CHART_COLORS.length;
    const color = CHART_COLORS[colorIndex];
    
    // Check if we have a single data point
    const isSinglePoint = exerciseData.length === 1;
    
    // For single data points in line charts, we need special handling
    if (isSinglePoint && config.chartType === 'line') {
      // For a single point, create a dataset with enhanced point styling
      return {
        labels: [new Date(exerciseData[0].date).toLocaleDateString()],
        datasets: [
          {
            label: metricLabel,
            data: [exerciseData[0][config.metric] || 0],
            borderColor: color.border,
            backgroundColor: color.background,
            pointRadius: 8, // Even larger point for better visibility
            pointHoverRadius: 10,
            borderWidth: 3,
            tension: 0, // Always use 0 tension to avoid control point errors
            fill: false,
          },
        ],
      };
    }
    
    // For single data points in bar charts, make the bar wider
    if (isSinglePoint && config.chartType === 'bar') {
      return {
        labels: [new Date(exerciseData[0].date).toLocaleDateString()],
        datasets: [
          {
            label: metricLabel,
            data: [exerciseData[0][config.metric] || 0],
            borderColor: color.border,
            backgroundColor: color.background,
            borderWidth: 2,
            barThickness: 60, // Wider bar for single point
          },
        ],
      };
    }
    
    // Normal case with multiple data points
    return {
      labels: exerciseData.map(d => new Date(d.date).toLocaleDateString()),
      datasets: [
        {
          label: metricLabel,
          data: exerciseData.map(d => d[config.metric] || 0),
          borderColor: color.border,
          backgroundColor: color.background,
          // Always set tension to 0 to completely avoid control point errors in production
          tension: 0,
          fill: config.chartType === 'line' ? false : undefined,
          // Increase point size for better visibility with few points
          pointRadius: exerciseData.length < 3 ? 5 : 3,
          pointHoverRadius: exerciseData.length < 3 ? 7 : 5,
        },
      ],
    };
  };
  
  // Wrap chart data generation in try-catch to prevent rendering errors
  let chartData;
  try {
    chartData = generateChartData();
  } catch (error) {
    console.error('Error generating chart data:', error);
    chartData = null;
  }
  
  // Add a safety check to prevent accessing properties of undefined data
  const isSinglePoint = chartData?.datasets?.[0]?.data?.length === 1;
  const chartOptions = getChartOptions(
    AVAILABLE_METRICS.find(m => m.value === config.metric)?.label || config.metric,
    isSinglePoint
  );
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex-1">
            <input
              type="text"
              value={config.title}
              onChange={(e) => onUpdateConfig(config.id, 'title', e.target.value)}
              className="text-lg font-medium text-gray-900 dark:text-white bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:outline-none focus:border-indigo-500 w-full"
            />
          </div>
          <button
            onClick={() => onRemoveChart(config.id)}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
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
          <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900 rounded-md">
            <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
              Personal Record: {personalRecords[config.exercise].weight} lbs on {new Date(personalRecords[config.exercise].date).toLocaleDateString()}
            </p>
          </div>
        )}
        
        {/* Chart */}
        {chartData ? (
          <div className="h-80">
            {config.chartType === 'line' ? (
              <Line 
                options={chartOptions} 
                data={chartData as ChartData<'line', number[], string>} 
              />
            ) : (
              <Bar 
                options={chartOptions} 
                data={chartData as ChartData<'bar', number[], string>} 
              />
            )}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-10">
            No data available for this configuration.
          </p>
        )}
      </div>
    </div>
  );
};

export default CustomChart; 