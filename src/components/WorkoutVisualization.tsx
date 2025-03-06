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
    if (!selectedExercise || workouts.length === 0) return;
    
    // Find all instances of the selected exercise
    const exerciseData: { date: string; weight?: number; reps?: number }[] = [];
    
    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
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
  }, [selectedExercise, workouts]);
  
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }
  
  if (error) {
    return <div className="text-red-500">{error}</div>;
  }
  
  if (workouts.length === 0) {
    return (
      <div className="bg-white shadow sm:rounded-lg p-6 text-center">
        <p className="text-gray-500">No workout data available for visualization. Start logging your workouts!</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {analysis && (
        <div className="bg-white shadow sm:rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">AI Analysis</h3>
          <div className="prose max-w-none">
            <p>{analysis}</p>
          </div>
        </div>
      )}
      
      <div className="bg-white shadow sm:rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Exercise Progress</h3>
        
        <div className="mb-4">
          <label htmlFor="exercise-select" className="block text-sm font-medium text-gray-700">
            Select Exercise
          </label>
          <select
            id="exercise-select"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
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
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Weight (lbs)'
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Date'
                    }
                  }
                }
              }}
              data={chartData}
            />
          </div>
        )}
      </div>
      
      {frequencyData && (
        <div className="bg-white shadow sm:rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Workout Frequency</h3>
          <div className="h-64">
            <Bar
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Number of Workouts'
                    }
                  }
                }
              }}
              data={frequencyData}
            />
          </div>
        </div>
      )}
    </div>
  );
} 