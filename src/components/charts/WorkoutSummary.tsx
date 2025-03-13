import React, { useState } from 'react';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { Workout } from '@/types';
import { DATE_RANGES, filterWorkoutsByDateRange } from './chartUtils';

interface WorkoutSummaryProps {
  workouts: Workout[];
  exerciseOptions: string[];
}

const WorkoutSummary: React.FC<WorkoutSummaryProps> = ({ workouts, exerciseOptions }) => {
  const [summaryDateRange, setSummaryDateRange] = useState<number>(90); // Date range for summary stats
  const [summaryCustomStartDate, setSummaryCustomStartDate] = useState<string>(''); // Custom start date for summary
  const [summaryCustomEndDate, setSummaryCustomEndDate] = useState<string>(''); // Custom end date for summary
  
  // Initialize custom date ranges
  React.useEffect(() => {
    // Set default custom date ranges (last 90 days)
    const today = new Date();
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(today.getDate() - 90);
    
    const todayStr = today.toISOString().split('T')[0];
    const ninetyDaysAgoStr = ninetyDaysAgo.toISOString().split('T')[0];
    
    setSummaryCustomStartDate(ninetyDaysAgoStr);
    setSummaryCustomEndDate(todayStr);
  }, []);
  
  // Get filtered workouts for summary
  const getFilteredWorkoutsForSummary = (): Workout[] => {
    return filterWorkoutsByDateRange(
      workouts, 
      summaryDateRange, 
      summaryCustomStartDate, 
      summaryCustomEndDate
    );
  };
  
  // Calculate average workout duration
  const calculateAverageWorkoutDuration = (): number => {
    const filteredWorkouts = getFilteredWorkoutsForSummary();
    const workoutsWithDuration = filteredWorkouts.filter(w => w.duration);
    
    if (workoutsWithDuration.length === 0) return 0;
    
    return Math.round(
      workoutsWithDuration.reduce((sum, workout) => sum + (workout.duration || 0), 0) / 
      workoutsWithDuration.length
    );
  };
  
  return (
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
            {calculateAverageWorkoutDuration()} min
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkoutSummary; 