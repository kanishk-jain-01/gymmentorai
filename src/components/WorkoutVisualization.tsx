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
import { Line, Bar, Pie, Radar } from 'react-chartjs-2';
import axios from 'axios';
import { useTheme } from 'next-themes';
import { Exercise, Workout } from '@/types';

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
  { label: 'All time', value: 0 }
];

export default function WorkoutVisualization() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [exerciseOptions, setExerciseOptions] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<number>(90); // Default to 3 months
  const [chartData, setChartData] = useState<ChartData<'line', number[], string> | null>(null);
  const [volumeData, setVolumeData] = useState<ChartData<'line', number[], string> | null>(null);
  const [frequencyData, setFrequencyData] = useState<ChartData<'bar', number[], string> | null>(null);
  const [exerciseDistribution, setExerciseDistribution] = useState<ChartData<'pie', number[], string> | null>(null);
  const [durationData, setDurationData] = useState<ChartData<'line', number[], string> | null>(null);
  const [personalRecords, setPersonalRecords] = useState<Record<string, { weight: number, date: string }>>({});
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'progress' | 'volume' | 'frequency' | 'distribution' | 'duration'>('progress');
  
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
        
        setExerciseOptions(Array.from(exerciseNames).sort());
        
        if (exerciseNames.size > 0) {
          setSelectedExercise(Array.from(exerciseNames)[0]);
        }
        
      } catch (err) {
        setError('Failed to load workout data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWorkouts();
  }, []);
  
  // Filter workouts by date range
  useEffect(() => {
    if (workouts.length === 0) return;
    
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
  
  // Update chart data when selected exercise or filtered workouts change
  useEffect(() => {
    if (!selectedExercise || filteredWorkouts.length === 0 || !mounted) return;
    
    // Find all instances of the selected exercise
    const exerciseData: { date: string; weight?: number; reps?: number; sets?: number; volume?: number }[] = [];
    
    filteredWorkouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        if (exercise.name === selectedExercise) {
          // Calculate volume (sets * reps * weight) if all values are present
          let volume: number | undefined = undefined;
          if (exercise.sets && exercise.reps && exercise.weight) {
            volume = exercise.sets * exercise.reps * exercise.weight;
          }
          
          exerciseData.push({
            date: workout.date,
            weight: exercise.weight,
            reps: exercise.reps,
            sets: exercise.sets,
            volume
          });
        }
      });
    });
    
    // Sort by date
    exerciseData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Prepare chart data
    if (exerciseData.length > 0) {
      const labels = exerciseData.map(d => new Date(d.date).toLocaleDateString());
      const isDark = theme === 'dark';
      const textColor = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
      const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
      
      // Weight progression chart
      setChartData({
        labels,
        datasets: [
          {
            label: 'Weight (lbs)',
            data: exerciseData.map(d => d.weight || 0),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            tension: 0.1
          },
        ],
      });
      
      // Volume progression chart (sets * reps * weight)
      setVolumeData({
        labels,
        datasets: [
          {
            label: 'Volume (sets × reps × weight)',
            data: exerciseData.map(d => d.volume || 0),
            borderColor: 'rgb(153, 102, 255)',
            backgroundColor: 'rgba(153, 102, 255, 0.5)',
            fill: true,
            tension: 0.1
          },
        ],
      });
    }
    
    // Exercise frequency chart
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
    
    setFrequencyData({
      labels: sortedMonths,
      datasets: [
        {
          label: 'Workout Frequency',
          data: sortedMonths.map(month => exerciseCounts[month]),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1
        },
      ],
    });
    
    // Exercise distribution pie chart
    const exerciseTypeCount: Record<string, number> = {};
    filteredWorkouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        exerciseTypeCount[exercise.name] = (exerciseTypeCount[exercise.name] || 0) + 1;
      });
    });
    
    // Get top 8 exercises, group the rest as "Other"
    const exerciseEntries = Object.entries(exerciseTypeCount).sort((a, b) => b[1] - a[1]);
    const topExercises = exerciseEntries.slice(0, 8);
    const otherExercises = exerciseEntries.slice(8);
    const otherCount = otherExercises.reduce((sum, [_, count]) => sum + count, 0);
    
    const pieLabels = topExercises.map(([name]) => name);
    const pieData = topExercises.map(([_, count]) => count);
    
    if (otherCount > 0) {
      pieLabels.push('Other');
      pieData.push(otherCount);
    }
    
    setExerciseDistribution({
      labels: pieLabels,
      datasets: [
        {
          data: pieData,
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(199, 199, 199, 0.7)',
            'rgba(83, 102, 255, 0.7)',
            'rgba(170, 170, 170, 0.7)',
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 206, 86)',
            'rgb(75, 192, 192)',
            'rgb(153, 102, 255)',
            'rgb(255, 159, 64)',
            'rgb(199, 199, 199)',
            'rgb(83, 102, 255)',
            'rgb(170, 170, 170)',
          ],
          borderWidth: 1,
        },
      ],
    });
    
    // Workout duration trend
    const durationData: { date: string; duration: number }[] = filteredWorkouts
      .filter(workout => workout.duration)
      .map(workout => ({
        date: workout.date,
        duration: workout.duration || 0
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (durationData.length > 0) {
      setDurationData({
        labels: durationData.map(d => new Date(d.date).toLocaleDateString()),
        datasets: [
          {
            label: 'Workout Duration (minutes)',
            data: durationData.map(d => d.duration),
            borderColor: 'rgb(255, 159, 64)',
            backgroundColor: 'rgba(255, 159, 64, 0.5)',
            tension: 0.1
          },
        ],
      });
    }
    
  }, [selectedExercise, filteredWorkouts, theme, mounted]);
  
  // Create a function to get common chart options based on theme
  const getChartOptions = (yAxisTitle: string) => {
    const isDark = theme === 'dark';
    const textColor = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
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
  
  // Get pie chart options
  const getPieOptions = () => {
    const isDark = theme === 'dark';
    const textColor = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
    
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right' as const,
          labels: {
            color: textColor
          }
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    };
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
  
  const isDark = theme === 'dark';
  const weightChartOptions = getChartOptions('Weight (lbs)');
  const volumeChartOptions = getChartOptions('Volume');
  const frequencyOptions = getChartOptions('Number of Workouts');
  const durationOptions = getChartOptions('Duration (minutes)');
  const pieOptions = getPieOptions();
  
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="w-full md:w-1/2">
            <label htmlFor="date-range" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Date Range
            </label>
            <select
              id="date-range"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
              value={dateRange}
              onChange={(e) => setDateRange(parseInt(e.target.value))}
            >
              {DATE_RANGES.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
          </div>
          
          <div className="w-full md:w-1/2">
            <label htmlFor="exercise-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Exercise
            </label>
            <select
              id="exercise-select"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
              value={selectedExercise || ''}
              onChange={(e) => setSelectedExercise(e.target.value)}
            >
              {exerciseOptions.map(exercise => (
                <option key={exercise} value={exercise}>{exercise}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Personal Records */}
        {selectedExercise && personalRecords[selectedExercise] && (
          <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900 rounded-md">
            <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
              Personal Record: {personalRecords[selectedExercise].weight} lbs on {new Date(personalRecords[selectedExercise].date).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
      
      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('progress')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'progress'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Weight Progress
            </button>
            <button
              onClick={() => setActiveTab('volume')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'volume'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Volume
            </button>
            <button
              onClick={() => setActiveTab('frequency')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'frequency'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Frequency
            </button>
            <button
              onClick={() => setActiveTab('distribution')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'distribution'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Distribution
            </button>
            <button
              onClick={() => setActiveTab('duration')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'duration'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Duration
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {/* Weight Progress Chart */}
          {activeTab === 'progress' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Weight Progress</h3>
              {chartData ? (
                <div className="h-80">
                  <Line
                    options={weightChartOptions}
                    data={chartData}
                  />
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-10">No weight data available for this exercise.</p>
              )}
            </div>
          )}
          
          {/* Volume Chart */}
          {activeTab === 'volume' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Volume Progression</h3>
              {volumeData ? (
                <div className="h-80">
                  <Line
                    options={volumeChartOptions}
                    data={volumeData}
                  />
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-10">No volume data available for this exercise.</p>
              )}
            </div>
          )}
          
          {/* Frequency Chart */}
          {activeTab === 'frequency' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Workout Frequency</h3>
              {frequencyData ? (
                <div className="h-80">
                  <Bar
                    options={frequencyOptions}
                    data={frequencyData}
                  />
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-10">No frequency data available.</p>
              )}
            </div>
          )}
          
          {/* Exercise Distribution */}
          {activeTab === 'distribution' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Exercise Distribution</h3>
              {exerciseDistribution ? (
                <div className="h-80">
                  <Pie
                    options={pieOptions}
                    data={exerciseDistribution}
                  />
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-10">No distribution data available.</p>
              )}
            </div>
          )}
          
          {/* Duration Chart */}
          {activeTab === 'duration' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Workout Duration</h3>
              {durationData ? (
                <div className="h-80">
                  <Line
                    options={durationOptions}
                    data={durationData}
                  />
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-10">No duration data available.</p>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Workout Stats Summary */}
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Workout Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Workouts</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredWorkouts.length}</p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Unique Exercises</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{exerciseOptions.length}</p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Workout Duration</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {filteredWorkouts.filter(w => w.duration).length > 0
                ? Math.round(
                    filteredWorkouts
                      .filter(w => w.duration)
                      .reduce((sum, workout) => sum + (workout.duration || 0), 0) / 
                    filteredWorkouts.filter(w => w.duration).length
                  )
                : 0} min
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 