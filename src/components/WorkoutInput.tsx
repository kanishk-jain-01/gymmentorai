import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';

interface WorkoutInputProps {
  onWorkoutAdded: () => void;
}

interface FormData {
  workoutText: string;
}

export default function WorkoutInput({ onWorkoutAdded }: WorkoutInputProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();
  
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setFeedback(null);
    
    try {
      await axios.post('/api/workout', { text: data.workoutText });
      setFeedback({ type: 'success', message: 'Workout added successfully!' });
      reset();
      onWorkoutAdded();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to add workout. Please try again.';
      setFeedback({ type: 'error', message: errorMessage });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Log your workout</h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
          <p>
            Describe your workout in natural language. Our AI will understand and organize it for you.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-5">
          <div className="w-full">
            <textarea
              id="workoutText"
              rows={5}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white bg-white"
              placeholder="Example: Today I did 3 sets of bench press at 185lbs for 8 reps, followed by 3 sets of squats at 225lbs for 5 reps. I finished with a 20 minute run on the treadmill."
              {...register('workoutText', { required: 'Please enter your workout details' })}
            />
            {errors.workoutText && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.workoutText.message}</p>
            )}
          </div>
          
          {feedback && (
            <div className={`mt-2 text-sm ${feedback.type === 'error' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
              {feedback.message}
            </div>
          )}
          
          <div className="mt-5">
            <button
              type="submit"
              disabled={isLoading}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-900 ${
                isLoading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Processing...' : 'Save Workout'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 