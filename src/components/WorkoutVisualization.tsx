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
  Filler,
  ScatterController,
  LineController
} from 'chart.js';
import axios from 'axios';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Workout, ChartConfig } from '@/types';

// Import our custom components
import { 
  CustomChart, 
  WorkoutFrequencyChart, 
  WorkoutSummary
} from '@/components/charts';

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
  Filler,
  ScatterController,
  LineController
);

// Set global defaults for Chart.js
ChartJS.defaults.elements.line.tension = 0; // Disable tension/bezier curves globally
ChartJS.defaults.elements.point.hitRadius = 10; // Increase hit radius for better interaction

// Additional protection against curve interpolation errors
ChartJS.defaults.elements.line.cubicInterpolationMode = 'monotone';
ChartJS.defaults.datasets.line = {
  ...ChartJS.defaults.datasets.line,
  tension: 0,
  cubicInterpolationMode: 'monotone'
};

export default function WorkoutVisualization() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exerciseOptions, setExerciseOptions] = useState<string[]>([]);
  const [personalRecords, setPersonalRecords] = useState<Record<string, { weight: number, date: string }>>({});
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
  
  // Calculate personal records
  useEffect(() => {
    if (workouts.length === 0) return;
    
    const records: Record<string, { weight: number, date: string }> = {};
    
    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        // Check each set for personal records
        exercise.sets.forEach(set => {
          if (set.weight && (!records[exercise.name] || set.weight > records[exercise.name].weight)) {
            records[exercise.name] = {
              weight: set.weight,
              date: workout.date
            };
          }
        });
      });
    });
    
    setPersonalRecords(records);
  }, [workouts]);
  
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
        <div className="h-6 bg-theme-border rounded w-1/4"></div>
        <div className="h-64 bg-theme-border rounded"></div>
        <div className="h-6 bg-theme-border rounded w-1/3"></div>
        <div className="h-64 bg-theme-border rounded"></div>
      </div>
    );
  }
  
  if (error) {
    return <div className="text-red-500">{error}</div>;
  }
  
  if (workouts.length === 0) {
    return (
      <div className="bg-theme-card shadow sm:rounded-lg p-6 text-center">
        <p className="text-theme-fg opacity-70">No workout data available for visualization. Start logging your workouts!</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header with title and Add Chart button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Workout Visualization</h1>
          <p className="mt-1 text-sm">
            Get insights into your fitness journey
          </p>
        </div>
        <button
          onClick={addChart}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-primary hover:bg-gradient-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-from transition-all duration-200"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Chart
        </button>
      </div>
      
      {/* Custom Charts */}
      {customCharts.map((chartConfig) => (
        <CustomChart
          key={chartConfig.id}
          config={chartConfig}
          workouts={workouts}
          exerciseOptions={exerciseOptions}
          personalRecords={personalRecords}
          onUpdateConfig={updateChartConfig}
          onRemoveChart={removeChart}
        />
      ))}
      
      {/* Workout Frequency */}
      <WorkoutFrequencyChart workouts={workouts} />
      
      {/* Workout Stats Summary */}
      <WorkoutSummary 
        workouts={workouts}
        exerciseOptions={exerciseOptions}
      />
    </div>
  );
} 