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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();
  
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await axios.post('/api/workout', { text: data.workoutText });
      setSuccess('Workout added successfully!');
      reset();
      onWorkoutAdded();
    } catch (err) {
      setError('Failed to add workout. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Log your workout</h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>
            Describe your workout in natural language. Our AI will understand and organize it for you.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-5">
          <div className="w-full">
            <textarea
              id="workoutText"
              rows={5}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Example: Today I did 3 sets of bench press at 185lbs for 8 reps, followed by 3 sets of squats at 225lbs for 5 reps. I finished with a 20 minute run on the treadmill."
              {...register('workoutText', { required: 'Please enter your workout details' })}
            />
            {errors.workoutText && (
              <p className="mt-2 text-sm text-red-600">{errors.workoutText.message}</p>
            )}
          </div>
          
          {error && (
            <div className="mt-2 text-sm text-red-600">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mt-2 text-sm text-green-600">
              {success}
            </div>
          )}
          
          <div className="mt-5">
            <button
              type="submit"
              disabled={isLoading}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
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