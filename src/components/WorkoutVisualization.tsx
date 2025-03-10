import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend,
  ChartData
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import axios from 'axios';
import { useTheme } from 'next-themes';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Exercise {
  id: string;
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number;
  distance?: number;
  notes?: string;
  createdAt: string;
}

interface Workout {
  id: string;
  date: string;
  name?: string;
  notes?: string;
  duration?: number;
  exercises: Exercise[];
}

export default function WorkoutVisualization() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [exerciseOptions, setExerciseOptions] = useState<string[]>([]);
  const [chartData, setChartData] = useState<ChartData<'line', number[], string> | null>(null);
  const [frequencyData, setFrequencyData] = useState<ChartData<'bar', number[], string> | null>(null);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Handle theme mounting
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Fetch workouts
  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/workout');
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
  
  // Fetch AI analysis
  useEffect(() => {
    const fetchAnalysis = async () => {
      if (workouts.length === 0) return;
      
      try {
        const response = await axios.get('/api/ai/analyze');
        setAnalysis(response.data.analysis);
      } catch (err) {
        console.error('Failed to load analysis:', err);
      }
    };
    
    fetchAnalysis();
  }, [workouts]);
  
  // Update chart data when selected exercise changes
  useEffect(() => {
    if (!selectedExercise || workouts.length === 0 || !mounted) return;
    
    // Find all instances of the selected exercise
    const exerciseData: { date: string; weight?: number; reps?: number }[] = [];
    
    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        // Use normalized exercise names for comparison
        if (exercise.name === selectedExercise) {
          exerciseData.push({
            date: workout.date,
            weight: exercise.weight,
            reps: exercise.reps
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
          },
        ],
      });
      
      // Exercise frequency chart
      const exerciseCounts: Record<string, number> = {};
      workouts.forEach(workout => {
        const date = new Date(workout.date).toLocaleDateString('en-US', { month: 'short' });
        exerciseCounts[date] = (exerciseCounts[date] || 0) + 1;
      });
      
      const months = Object.keys(exerciseCounts);
      
      setFrequencyData({
        labels: months,
        datasets: [
          {
            label: 'Workout Frequency',
            data: months.map(month => exerciseCounts[month]),
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
          },
        ],
      });
    }
  }, [selectedExercise, workouts, theme, mounted]);
  
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
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Weight (lbs)',
          color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'
        },
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date',
          color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'
        },
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'
        }
      }
    }
  };
  
  const frequencyOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        title: {
          ...chartOptions.scales.y.title,
          text: 'Number of Workouts'
        }
      }
    }
  };
  
  return (
    <div className="space-y-6">
      {analysis && (
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">AI Analysis</h3>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300">{analysis}</p>
          </div>
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Exercise Progress</h3>
        
        <div className="mb-4">
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
              <option key={exercise} value={exercise}>
                {exercise}
              </option>
            ))}
          </select>
        </div>
        
        {chartData && (
          <div className="h-64">
            <Line
              options={chartOptions}
              data={chartData}
            />
          </div>
        )}
      </div>
      
      {frequencyData && (
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Workout Frequency</h3>
          <div className="h-64">
            <Bar
              options={frequencyOptions}
              data={frequencyData}
            />
          </div>
        </div>
      )}
    </div>
  );
} 