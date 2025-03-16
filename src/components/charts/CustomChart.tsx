import React from 'react';
import { Line, Bar, Scatter, Chart } from 'react-chartjs-2';
import { ChartData, ChartDataset, ScatterDataPoint } from 'chart.js';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Workout, Exercise, Set } from '@/types';
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

// Define a type for mixed chart data
interface MixedChartData {
  labels: string[];
  datasets: Array<
    | ChartDataset<'line', number[]>
    | ChartDataset<'scatter', ScatterDataPoint[]>
    | ChartDataset<'bar', number[]>
  >;
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
  const generateChartData = (): CustomChartData | MixedChartData | null => {
    if (!config.exercise || workouts.length === 0) return null;
    
    // Get workouts filtered by this chart's date range
    const chartFilteredWorkouts = filterWorkoutsByDateRange(
      workouts, 
      config.dateRange, 
      config.customStartDate, 
      config.customEndDate
    );
    
    // Group data by date first
    const exerciseDataByDate: Record<string, {
      date: string;
      formattedDate: string;
      sets: {
        setIndex: number;
        weight?: number;
        reps?: number;
        volume?: number;
        duration?: number;
        distance?: number;
      }[];
    }> = {};
    
    // Find all instances of the selected exercise and their sets
    chartFilteredWorkouts.forEach(workout => {
      const workoutDate = new Date(workout.date);
      const dateKey = workoutDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      const formattedDate = workoutDate.toLocaleDateString();
      
      workout.exercises.forEach(exercise => {
        if (exercise.name === config.exercise) {
          // Initialize date entry if it doesn't exist
          if (!exerciseDataByDate[dateKey]) {
            exerciseDataByDate[dateKey] = {
              date: workout.date,
              formattedDate,
              sets: []
            };
          }
          
          // Process each set individually
          exercise.sets.forEach((set, setIndex) => {
            // Calculate volume if weight and reps are present
            let volume: number | undefined = undefined;
            if (set.reps && set.weight) {
              volume = set.reps * set.weight;
            }
            
            exerciseDataByDate[dateKey].sets.push({
              setIndex: setIndex + 1,
              weight: set.weight,
              reps: set.reps,
              volume,
              duration: set.duration,
              distance: set.distance
            });
          });
        }
      });
    });
    
    // Convert to array and sort by date
    const dateEntries = Object.values(exerciseDataByDate).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    if (dateEntries.length === 0) return null;
    
    // Get metric label
    const metricLabel = AVAILABLE_METRICS.find(m => m.value === config.metric)?.label || config.metric;
    
    // Get color for this chart (cycle through colors)
    const colorIndex = parseInt(config.id) % CHART_COLORS.length;
    const color = CHART_COLORS[colorIndex];
    
    // Check if we have a single date point
    const isSingleDate = dateEntries.length === 1;
    
    // For line charts, we'll create two datasets:
    // 1. A line connecting the average value for each day
    // 2. Scatter points showing individual sets
    if (config.chartType === 'line') {
      // Calculate average values for each day for the line
      const averageValues = dateEntries.map(entry => {
        const validValues = entry.sets
          .map(set => set[config.metric])
          .filter(val => val !== undefined && val !== null) as number[];
        
        return validValues.length > 0
          ? validValues.reduce((sum, val) => sum + val, 0) / validValues.length
          : 0;
      });
      
      // For a single date with multiple sets, use a scatter chart instead of bar chart
      if (isSingleDate) {
        // Create data points for individual sets
        const singleDateData = dateEntries[0].sets.map(set => {
          const value = set[config.metric];
          return value !== undefined && value !== null ? {
            x: 0, // Use same x-coordinate (0) for all points to stack them vertically
            y: value
          } : null;
        }).filter(point => point !== null);
        
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
            }
          ],
        };
      }
      
      // For multiple dates, we'll create a different approach
      // First, prepare the labels (dates)
      const labels = dateEntries.map(entry => entry.formattedDate);
      
      // Create an array of arrays, where each inner array contains all values for a specific date
      const valuesByDate: number[][] = dateEntries.map(entry => 
        entry.sets
          .map(set => set[config.metric])
          .filter(val => val !== undefined && val !== null) as number[]
      );
      
      // Create datasets: one line for averages and multiple scatter datasets (one per date)
      const datasets: any[] = [
        {
          type: 'line' as const,
          label: `${metricLabel} (Average)`,
          data: averageValues,
          borderColor: color.border,
          backgroundColor: 'transparent',
          borderWidth: 2,
          tension: 0,
          fill: false,
          pointRadius: 0, // Hide points on the line
        }
      ];
      
      // Add scatter datasets - one for each date
      valuesByDate.forEach((values, dateIndex) => {
        if (values.length > 0) {
          // Create a scatter dataset that places all points at the same x position (dateIndex)
          const scatterData = values.map(value => ({
            x: labels[dateIndex],
            y: value
          }));
          
          datasets.push({
            type: 'scatter' as const,
            label: `${labels[dateIndex]} Sets`,
            data: scatterData,
            backgroundColor: color.background,
            borderColor: color.border,
            pointRadius: 5,
            pointHoverRadius: 7,
            showLine: false
          });
        }
      });
      
      return {
        labels,
        datasets
      };
    }
    
    // For bar charts, we'll show the average value for each day
    if (config.chartType === 'bar') {
      // Calculate average values for each day
      const averageValues = dateEntries.map(entry => {
        const validValues = entry.sets
          .map(set => set[config.metric])
          .filter(val => val !== undefined && val !== null) as number[];
        
        return validValues.length > 0
          ? validValues.reduce((sum, val) => sum + val, 0) / validValues.length
          : 0;
      });
      
      // For multiple dates
      return {
        labels: dateEntries.map(entry => entry.formattedDate),
        datasets: [
          {
            label: `${metricLabel} (Average)`,
            data: averageValues,
            borderColor: color.border,
            backgroundColor: color.background,
            borderWidth: 2,
          },
        ],
      };
    }
    
    return null;
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
  const isSinglePoint = chartData?.labels?.length === 1;
  const chartOptions = getChartOptions(
    AVAILABLE_METRICS.find(m => m.value === config.metric)?.label || config.metric,
    isSinglePoint
  );
  
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
            {config.chartType === 'line' ? (
              <Chart 
                type="line"
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      display: false
                    },
                    tooltip: {
                      ...chartOptions.plugins?.tooltip,
                      callbacks: {
                        label: function(context) {
                          const datasetLabel = context.dataset.label || '';
                          const value = context.parsed.y;
                          
                          // Get the metric label for consistent display
                          const displayMetric = AVAILABLE_METRICS.find(m => m.value === config.metric)?.label || config.metric;
                          
                          // Check if this is a scatter dataset by checking the label pattern
                          if (datasetLabel.includes('Sets')) {
                            return `${displayMetric}: ${value}`;
                          }
                          
                          // For line dataset (averages)
                          return `${datasetLabel}: ${value}`;
                        },
                        title: function(tooltipItems) {
                          // Get the first tooltip item
                          const item = tooltipItems[0];
                          
                          // Check if this is a scatter dataset by checking the label pattern
                          if (item.dataset.label?.includes('Sets')) {
                            // Extract the date from the dataset label (format: "Date Sets")
                            return item.dataset.label.split(' Sets')[0];
                          }
                          
                          // For line points, use the label from the x-axis
                          return item.label;
                        }
                      }
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
                data={chartData as any} 
              />
            ) : (
              <Bar 
                options={chartOptions} 
                data={chartData as ChartData<'bar', number[], string>} 
              />
            )}
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