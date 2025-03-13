import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  PieController,
  ArcElement,
  RadialLinearScale,
  Title, 
  Tooltip, 
  Legend,
  ChartData,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import axios from 'axios';
import { useTheme } from 'next-themes';
import { Exercise, Workout } from '@/types';
import { PlusIcon, XMarkIcon, CalendarIcon } from '@heroicons/react/24/outline';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  PieController,
  ArcElement,
  RadialLinearScale,
  Title, 
  Tooltip, 
  Legend,
  Filler
);

// Date range options
const DATE_RANGES = [
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 3 months', value: 90 },
  { label: 'Last 6 months', value: 180 },
  { label: '1 year', value: 365 },
  { label: 'All time', value: 0 },
  { label: 'Custom range', value: -1 }
];

// Chart type options
const CHART_TYPES = [
  { label: 'Line', value: 'line' },
  { label: 'Bar', value: 'bar' },
];

// Available metrics for y-axis
const AVAILABLE_METRICS = [
  { label: 'Weight (lbs)', value: 'weight' },
  { label: 'Reps', value: 'reps' },
  { label: 'Sets', value: 'sets' },
  { label: 'Volume (sets × reps × weight)', value: 'volume' },
  { label: 'Duration (minutes)', value: 'duration' },
  { label: 'Distance', value: 'distance' },
];

// Chart colors
const CHART_COLORS = [
  { border: 'rgb(75, 192, 192)', background: 'rgba(75, 192, 192, 0.5)' },
  { border: 'rgb(153, 102, 255)', background: 'rgba(153, 102, 255, 0.5)' },
  { border: 'rgb(255, 99, 132)', background: 'rgba(255, 99, 132, 0.5)' },
  { border: 'rgb(54, 162, 235)', background: 'rgba(54, 162, 235, 0.5)' },
  { border: 'rgb(255, 159, 64)', background: 'rgba(255, 159, 64, 0.5)' },
];

// Interface for custom chart configuration
interface ChartConfig {
  id: string;
  chartType: 'line' | 'bar';
  metric: string;
  exercise: string | null;
  title: string;
  dateRange: number;
  customStartDate?: string; // Optional custom start date
  customEndDate?: string;   // Optional custom end date
}

// Type for chart data that can be either line or bar
type CustomChartData = ChartData<'line', number[], string> | ChartData<'bar', number[], string>;

export default function WorkoutVisualization() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exerciseOptions, setExerciseOptions] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<number>(90); // Global date range (now used for new charts and frequency chart)
  const [frequencyDateRange, setFrequencyDateRange] = useState<number>(90); // Date range for frequency chart
  const [frequencyCustomStartDate, setFrequencyCustomStartDate] = useState<string>(''); // Custom start date for frequency
  const [frequencyCustomEndDate, setFrequencyCustomEndDate] = useState<string>(''); // Custom end date for frequency
  const [summaryDateRange, setSummaryDateRange] = useState<number>(90); // Date range for summary stats
  const [summaryCustomStartDate, setSummaryCustomStartDate] = useState<string>(''); // Custom start date for summary
  const [summaryCustomEndDate, setSummaryCustomEndDate] = useState<string>(''); // Custom end date for summary
  const [personalRecords, setPersonalRecords] = useState<Record<string, { weight: number, date: string }>>({});
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Custom charts state
  const [customCharts, setCustomCharts] = useState<ChartConfig[]>([
    {
      id: '1',
      chartType: 'line',
      metric: 'weight',
      exercise: null,
      title: 'Weight Progress',
      dateRange: 90 // Default to 3 months
    }
  ]);
  
  // Handle theme mounting
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Fetch workouts
  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setIsLoading(true);
        // Use the all workouts endpoint to get complete history
        const response = await axios.get('/api/workout/all');
        setWorkouts(response.data.workouts);
        
        // Extract unique exercise names
        const exerciseNames = new Set<string>();
        response.data.workouts.forEach((workout: Workout) => {
          workout.exercises.forEach(exercise => {
            exerciseNames.add(exercise.name);
          });
        });
        
        const sortedExercises = Array.from(exerciseNames).sort();
        setExerciseOptions(sortedExercises);
        
        // Set default exercise for charts that don't have one
        setCustomCharts(prev => 
          prev.map(chart => ({
            ...chart,
            exercise: chart.exercise || (sortedExercises.length > 0 ? sortedExercises[0] : null)
          }))
        );
        
      } catch (err) {
        setError('Failed to load workout data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWorkouts();
  }, []);
  
  // Filter workouts by date range for a specific chart
  const getFilteredWorkoutsForChart = (config: ChartConfig): Workout[] => {
    if (workouts.length === 0) return [];
    
    // Handle custom date range
    if (config.dateRange === -1 && config.customStartDate && config.customEndDate) {
      const startDate = new Date(config.customStartDate);
      const endDate = new Date(config.customEndDate);
      endDate.setHours(23, 59, 59, 999); // Set to end of day
      
      return workouts.filter(workout => {
        const workoutDate = new Date(workout.date);
        return workoutDate >= startDate && workoutDate <= endDate;
      });
    }
    
    // Handle predefined date ranges
    if (config.dateRange === 0) {
      // All time
      return workouts;
    } else {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - config.dateRange);
      
      return workouts.filter(workout => {
        const workoutDate = new Date(workout.date);
        return workoutDate >= cutoffDate;
      });
    }
  };
  
  // Filter workouts by global date range (for frequency chart and stats)
  useEffect(() => {
    if (workouts.length === 0) return;
    
    // Use the same logic but with the global dateRange
    if (dateRange === 0) {
      // All time
      setFilteredWorkouts(workouts);
    } else {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - dateRange);
      
      const filtered = workouts.filter(workout => {
        const workoutDate = new Date(workout.date);
        return workoutDate >= cutoffDate;
      });
      
      setFilteredWorkouts(filtered);
    }
  }, [workouts, dateRange]);
  
  // Initialize custom date ranges
  useEffect(() => {
    // Set default custom date ranges (last 90 days)
    const today = new Date();
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(today.getDate() - 90);
    
    const todayStr = today.toISOString().split('T')[0];
    const ninetyDaysAgoStr = ninetyDaysAgo.toISOString().split('T')[0];
    
    setFrequencyCustomStartDate(ninetyDaysAgoStr);
    setFrequencyCustomEndDate(todayStr);
    setSummaryCustomStartDate(ninetyDaysAgoStr);
    setSummaryCustomEndDate(todayStr);
  }, []);
  
  // Filter workouts by date range for frequency chart
  const getFilteredWorkoutsForFrequency = (): Workout[] => {
    if (workouts.length === 0) return [];
    
    // Handle custom date range
    if (frequencyDateRange === -1 && frequencyCustomStartDate && frequencyCustomEndDate) {
      const startDate = new Date(frequencyCustomStartDate);
      const endDate = new Date(frequencyCustomEndDate);
      endDate.setHours(23, 59, 59, 999); // Set to end of day
      
      return workouts.filter(workout => {
        const workoutDate = new Date(workout.date);
        return workoutDate >= startDate && workoutDate <= endDate;
      });
    }
    
    // Handle predefined date ranges
    if (frequencyDateRange === 0) {
      // All time
      return workouts;
    } else {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - frequencyDateRange);
      
      return workouts.filter(workout => {
        const workoutDate = new Date(workout.date);
        return workoutDate >= cutoffDate;
      });
    }
  };
  
  // Filter workouts by date range for summary stats
  const getFilteredWorkoutsForSummary = (): Workout[] => {
    if (workouts.length === 0) return [];
    
    // Handle custom date range
    if (summaryDateRange === -1 && summaryCustomStartDate && summaryCustomEndDate) {
      const startDate = new Date(summaryCustomStartDate);
      const endDate = new Date(summaryCustomEndDate);
      endDate.setHours(23, 59, 59, 999); // Set to end of day
      
      return workouts.filter(workout => {
        const workoutDate = new Date(workout.date);
        return workoutDate >= startDate && workoutDate <= endDate;
      });
    }
    
    // Handle predefined date ranges
    if (summaryDateRange === 0) {
      // All time
      return workouts;
    } else {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - summaryDateRange);
      
      return workouts.filter(workout => {
        const workoutDate = new Date(workout.date);
        return workoutDate >= cutoffDate;
      });
    }
  };
  
  // Calculate personal records
  useEffect(() => {
    if (workouts.length === 0) return;
    
    const records: Record<string, { weight: number, date: string }> = {};
    
    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        if (exercise.weight && (!records[exercise.name] || exercise.weight > records[exercise.name].weight)) {
          records[exercise.name] = {
            weight: exercise.weight,
            date: workout.date
          };
        }
      });
    });
    
    setPersonalRecords(records);
  }, [workouts]);
  
  // Create a function to get common chart options based on theme
  const getChartOptions = (yAxisTitle: string, isSinglePoint: boolean = false) => {
    const isDark = theme === 'dark';
    const textColor = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    // Base options that work for both single and multiple data points
    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: yAxisTitle,
            color: textColor
          },
          grid: {
            color: gridColor
          },
          ticks: {
            color: textColor
          }
        },
        x: {
          title: {
            display: true,
            text: 'Date',
            color: textColor
          },
          grid: {
            color: gridColor
          },
          ticks: {
            color: textColor
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += context.parsed.y;
              }
              return label;
            }
          }
        }
      }
    };
  };
  
  // Generate chart data based on configuration
  const generateChartData = (config: ChartConfig): CustomChartData | null => {
    if (!config.exercise || workouts.length === 0 || !mounted) return null;
    
    // Get workouts filtered by this chart's date range
    const chartFilteredWorkouts = getFilteredWorkoutsForChart(config);
    
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
            tension: 0,
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
          tension: 0.1,
          fill: config.chartType === 'line' ? false : undefined,
          // Increase point size for better visibility with few points
          pointRadius: exerciseData.length < 3 ? 5 : 3,
          pointHoverRadius: exerciseData.length < 3 ? 7 : 5,
        },
      ],
    };
  };
  
  // Generate workout frequency data
  const generateFrequencyData = (): ChartData<'bar', number[], string> | null => {
    const filteredWorkouts = getFilteredWorkoutsForFrequency();
    if (filteredWorkouts.length === 0 || !mounted) return null;
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const exerciseCounts: Record<string, number> = {};
    
    filteredWorkouts.forEach(workout => {
      const date = new Date(workout.date);
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      exerciseCounts[monthKey] = (exerciseCounts[monthKey] || 0) + 1;
    });
    
    // Sort months chronologically
    const sortedMonths = Object.keys(exerciseCounts).sort((a, b) => {
      const [aMonth, aYear] = a.split(' ');
      const [bMonth, bYear] = b.split(' ');
      const aDate = new Date(`${aMonth} 1, ${aYear}`);
      const bDate = new Date(`${bMonth} 1, ${bYear}`);
      return aDate.getTime() - bDate.getTime();
    });
    
    // For a single data point, enhance the styling
    const isSinglePoint = sortedMonths.length === 1;
    
    // If we have a single data point, make it more prominent
    if (isSinglePoint) {
      return {
        labels: sortedMonths,
        datasets: [
          {
            label: 'Workout Frequency',
            data: sortedMonths.map(month => exerciseCounts[month]),
            backgroundColor: 'rgba(54, 162, 235, 0.7)', // More vibrant color
            borderColor: 'rgb(54, 162, 235)',
            borderWidth: 2,
            barThickness: 80, // Extra wide bar for single point
          },
        ],
      };
    }
    
    // Normal case with multiple data points
    return {
      labels: sortedMonths,
      datasets: [
        {
          label: 'Workout Frequency',
          data: sortedMonths.map(month => exerciseCounts[month]),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1,
          // Make bars wider when there are fewer data points
          barThickness: sortedMonths.length < 3 ? 60 : undefined,
        },
      ],
    };
  };
  
  // Add a new chart
  const addChart = () => {
    const newId = (customCharts.length + 1).toString();
    
    // Get today's date and 90 days ago for default custom range
    const today = new Date();
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(today.getDate() - 90);
    
    setCustomCharts([
      ...customCharts,
      {
        id: newId,
        chartType: 'line',
        metric: 'weight',
        exercise: exerciseOptions.length > 0 ? exerciseOptions[0] : null,
        title: `Chart ${newId}`,
        dateRange: 90, // Default to 3 months
        customStartDate: ninetyDaysAgo.toISOString().split('T')[0], // Default to 90 days ago
        customEndDate: today.toISOString().split('T')[0] // Default to today
      }
    ]);
  };
  
  // Remove a chart
  const removeChart = (id: string) => {
    setCustomCharts(customCharts.filter(chart => chart.id !== id));
  };
  
  // Update chart configuration
  const updateChartConfig = (id: string, field: keyof ChartConfig, value: any) => {
    setCustomCharts(
      customCharts.map(chart => 
        chart.id === id ? { ...chart, [field]: value } : chart
      )
    );
  };
  
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }
  
  if (error) {
    return <div className="text-red-500 dark:text-red-400">{error}</div>;
  }
  
  if (workouts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">No workout data available for visualization. Start logging your workouts!</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Add Chart Button */}
      <div className="flex justify-end">
        <button
          onClick={addChart}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Chart
        </button>
      </div>
      
      {/* Custom Charts */}
      {customCharts.map((chartConfig) => {
        const chartData = generateChartData(chartConfig);
        const isSinglePoint = chartData?.datasets[0]?.data.length === 1;
        const chartOptions = getChartOptions(
          AVAILABLE_METRICS.find(m => m.value === chartConfig.metric)?.label || chartConfig.metric,
          isSinglePoint
        );
        
        return (
          <div key={chartConfig.id} className="bg-white dark:bg-gray-800 shadow sm:rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={chartConfig.title}
                    onChange={(e) => updateChartConfig(chartConfig.id, 'title', e.target.value)}
                    className="text-lg font-medium text-gray-900 dark:text-white bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:outline-none focus:border-indigo-500 w-full"
                  />
                </div>
                <button
                  onClick={() => removeChart(chartConfig.id)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label htmlFor={`exercise-${chartConfig.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Exercise
                  </label>
                  <select
                    id={`exercise-${chartConfig.id}`}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                    value={chartConfig.exercise || ''}
                    onChange={(e) => updateChartConfig(chartConfig.id, 'exercise', e.target.value)}
                  >
                    {exerciseOptions.map(exercise => (
                      <option key={exercise} value={exercise}>{exercise}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor={`metric-${chartConfig.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Y-Axis Metric
                  </label>
                  <select
                    id={`metric-${chartConfig.id}`}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                    value={chartConfig.metric}
                    onChange={(e) => updateChartConfig(chartConfig.id, 'metric', e.target.value)}
                  >
                    {AVAILABLE_METRICS.map(metric => (
                      <option key={metric.value} value={metric.value}>{metric.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor={`chart-type-${chartConfig.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Chart Type
                  </label>
                  <select
                    id={`chart-type-${chartConfig.id}`}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                    value={chartConfig.chartType}
                    onChange={(e) => updateChartConfig(chartConfig.id, 'chartType', e.target.value as 'line' | 'bar')}
                  >
                    {CHART_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor={`date-range-${chartConfig.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Date Range
                  </label>
                  <select
                    id={`date-range-${chartConfig.id}`}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                    value={chartConfig.dateRange}
                    onChange={(e) => updateChartConfig(chartConfig.id, 'dateRange', parseInt(e.target.value))}
                  >
                    {DATE_RANGES.map(range => (
                      <option key={range.value} value={range.value}>{range.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Custom Date Range Inputs (shown only when custom range is selected) */}
              {chartConfig.dateRange === -1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <label htmlFor={`start-date-${chartConfig.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Start Date
                      </label>
                      <input
                        type="date"
                        id={`start-date-${chartConfig.id}`}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                        value={chartConfig.customStartDate || ''}
                        onChange={(e) => updateChartConfig(chartConfig.id, 'customStartDate', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <label htmlFor={`end-date-${chartConfig.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        End Date
                      </label>
                      <input
                        type="date"
                        id={`end-date-${chartConfig.id}`}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                        value={chartConfig.customEndDate || ''}
                        onChange={(e) => updateChartConfig(chartConfig.id, 'customEndDate', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Personal Records */}
              {chartConfig.exercise && personalRecords[chartConfig.exercise] && chartConfig.metric === 'weight' && (
                <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900 rounded-md">
                  <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                    Personal Record: {personalRecords[chartConfig.exercise].weight} lbs on {new Date(personalRecords[chartConfig.exercise].date).toLocaleDateString()}
                  </p>
                </div>
              )}
              
              {/* Chart */}
              {chartData ? (
                <div className="h-80">
                  {chartConfig.chartType === 'line' ? (
                    <Line options={chartOptions} data={chartData as ChartData<'line', number[], string>} />
                  ) : (
                    <Bar options={chartOptions} data={chartData as ChartData<'bar', number[], string>} />
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
      })}
      
      {/* Workout Frequency */}
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Workout Frequency</h3>
          
          <div className="mt-2 md:mt-0 w-full md:w-48">
            <select
              id="frequency-date-range"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
              value={frequencyDateRange}
              onChange={(e) => setFrequencyDateRange(parseInt(e.target.value))}
            >
              {DATE_RANGES.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Custom Date Range for Frequency */}
        {frequencyDateRange === -1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <label htmlFor="frequency-start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Start Date
                </label>
                <input
                  type="date"
                  id="frequency-start-date"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                  value={frequencyCustomStartDate}
                  onChange={(e) => setFrequencyCustomStartDate(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <label htmlFor="frequency-end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  End Date
                </label>
                <input
                  type="date"
                  id="frequency-end-date"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                  value={frequencyCustomEndDate}
                  onChange={(e) => setFrequencyCustomEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
        
        {generateFrequencyData() ? (
          <div className="h-80">
            <Bar
              options={getChartOptions('Number of Workouts', generateFrequencyData()?.datasets[0]?.data.length === 1)}
              data={generateFrequencyData()!}
            />
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-10">No frequency data available.</p>
        )}
      </div>
      
      {/* Workout Stats Summary */}
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Workout Summary</h3>
          
          <div className="mt-2 md:mt-0 w-full md:w-48">
            <select
              id="summary-date-range"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
              value={summaryDateRange}
              onChange={(e) => setSummaryDateRange(parseInt(e.target.value))}
            >
              {DATE_RANGES.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Custom Date Range for Summary */}
        {summaryDateRange === -1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <label htmlFor="summary-start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Start Date
                </label>
                <input
                  type="date"
                  id="summary-start-date"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                  value={summaryCustomStartDate}
                  onChange={(e) => setSummaryCustomStartDate(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <label htmlFor="summary-end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  End Date
                </label>
                <input
                  type="date"
                  id="summary-end-date"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                  value={summaryCustomEndDate}
                  onChange={(e) => setSummaryCustomEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Workouts</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{getFilteredWorkoutsForSummary().length}</p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Unique Exercises</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{exerciseOptions.length}</p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Workout Duration</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {(() => {
                const filteredWorkouts = getFilteredWorkoutsForSummary();
                const workoutsWithDuration = filteredWorkouts.filter(w => w.duration);
                
                if (workoutsWithDuration.length === 0) return 0;
                
                return Math.round(
                  workoutsWithDuration.reduce((sum, workout) => sum + (workout.duration || 0), 0) / 
                  workoutsWithDuration.length
                );
              })() + ' min'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 