import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { ChartData } from 'chart.js';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { Workout } from '@/types';
import { 
  DATE_RANGES, 
  filterWorkoutsByDateRange,
  useChartOptions
} from './chartUtils';

interface WorkoutFrequencyChartProps {
  workouts: Workout[];
}

const WorkoutFrequencyChart: React.FC<WorkoutFrequencyChartProps> = ({ workouts }) => {
  const [frequencyDateRange, setFrequencyDateRange] = useState<number>(90); // Date range for frequency chart
  const [frequencyCustomStartDate, setFrequencyCustomStartDate] = useState<string>(''); // Custom start date for frequency
  const [frequencyCustomEndDate, setFrequencyCustomEndDate] = useState<string>(''); // Custom end date for frequency
  const { getChartOptions } = useChartOptions();
  
  // Initialize custom date ranges
  React.useEffect(() => {
    // Set default custom date ranges (last 90 days)
    const today = new Date();
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(today.getDate() - 90);
    
    const todayStr = today.toISOString().split('T')[0];
    const ninetyDaysAgoStr = ninetyDaysAgo.toISOString().split('T')[0];
    
    setFrequencyCustomStartDate(ninetyDaysAgoStr);
    setFrequencyCustomEndDate(todayStr);
  }, []);
  
  // Generate workout frequency data
  const generateFrequencyData = (): ChartData<'bar', number[], string> | null => {
    if (workouts.length === 0) return null;
    
    const filteredWorkouts = filterWorkoutsByDateRange(
      workouts, 
      frequencyDateRange, 
      frequencyCustomStartDate, 
      frequencyCustomEndDate
    );
    
    if (filteredWorkouts.length === 0) return null;
    
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
  
  return (
    <div className="bg-theme-card shadow sm:rounded-lg p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <h3 className="text-lg font-medium text-theme-fg">Workout Frequency</h3>
        
        <div className="mt-2 md:mt-0 w-full md:w-48">
          <select
            id="frequency-date-range"
            className="block w-full pl-3 pr-10 py-2 text-base border-theme-border focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-theme-card text-theme-fg"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-3 bg-theme-bg rounded-md">
          <div className="flex items-center">
            <CalendarIcon className="h-5 w-5 text-theme-fg opacity-50 mr-2" />
            <div>
              <label htmlFor="frequency-start-date" className="block text-sm font-medium text-theme-fg">
                Start Date
              </label>
              <input
                type="date"
                id="frequency-start-date"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-theme-border focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-theme-card text-theme-fg"
                value={frequencyCustomStartDate}
                onChange={(e) => setFrequencyCustomStartDate(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center">
            <CalendarIcon className="h-5 w-5 text-theme-fg opacity-50 mr-2" />
            <div>
              <label htmlFor="frequency-end-date" className="block text-sm font-medium text-theme-fg">
                End Date
              </label>
              <input
                type="date"
                id="frequency-end-date"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-theme-border focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-theme-card text-theme-fg"
                value={frequencyCustomEndDate}
                onChange={(e) => setFrequencyCustomEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
      
      {(() => {
        // Wrap frequency data generation in try-catch
        let frequencyData;
        try {
          frequencyData = generateFrequencyData();
        } catch (error) {
          console.error('Error generating frequency data:', error);
          frequencyData = null;
        }
        
        // Add more safety checks with optional chaining
        const isSinglePoint = frequencyData?.datasets?.[0]?.data?.length === 1;
        
        return frequencyData ? (
          <div className="h-80">
            <Bar
              options={getChartOptions('Number of Workouts', isSinglePoint)}
              data={frequencyData}
            />
          </div>
        ) : (
          <p className="text-theme-fg opacity-70 text-center py-10">No frequency data available.</p>
        );
      })()}
    </div>
  );
};

export default WorkoutFrequencyChart; 