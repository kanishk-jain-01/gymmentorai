import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import Link from 'next/link';

interface WorkoutInputProps {
  onWorkoutAdded: () => void;
}

interface FormData {
  workoutText: string;
}

export default function WorkoutInput({ onWorkoutAdded }: WorkoutInputProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ 
    type: 'success' | 'error' | 'subscription' | 'limit'; 
    message: string;
  } | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();
  
  const validateWorkout = async (text: string): Promise<{ 
    isValid: boolean; 
    apiLimitExceeded?: boolean;
    message?: string;
  }> => {
    try {
      const response = await axios.post('/api/validate-workout', { text });
      return { 
        isValid: response.data.isWorkoutRelated
      };
    } catch (error: any) {
      console.error('Validation error:', error);
      
      // Check if this is an API limit exceeded error
      if (error.response?.data?.code === 'API_LIMIT_EXCEEDED') {
        return { 
          isValid: false, 
          apiLimitExceeded: true,
          message: error.response?.data?.message || 'You have reached your daily API request limit.'
        };
      }
      
      return { isValid: false };
    }
  };
  
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setFeedback(null);
    
    try {
      // First validate if the input is workout-related
      setIsValidating(true);
      const validationResult = await validateWorkout(data.workoutText);
      setIsValidating(false);
      
      // Check if API limit is exceeded
      if (validationResult.apiLimitExceeded) {
        setFeedback({ 
          type: 'limit', 
          message: validationResult.message || 'You have reached your daily API request limit. Please try again tomorrow or edit a logged workout'
        });
        return;
      }
      
      if (!validationResult.isValid) {
        setFeedback({ 
          type: 'error', 
          message: 'Please enter a valid workout description. Random text or non-workout content is not allowed.' 
        });
        return;
      }
      
      // If valid, proceed with saving the workout
      const response = await axios.post('/api/workout', { text: data.workoutText });
      setFeedback({ 
        type: 'success', 
        message: 'Workout added successfully!'
      });
      reset();
      onWorkoutAdded();
    } catch (err: any) {
      // Check if this is a subscription required error
      if (err.response?.data?.code === 'SUBSCRIPTION_REQUIRED') {
        setFeedback({ 
          type: 'subscription', 
          message: err.response?.data?.message || 'Your trial has ended. Please subscribe to continue adding workouts.' 
        });
      } 
      else {
        const errorMessage = err.response?.data?.error || 'Failed to add workout. Please try again.';
        setFeedback({ type: 'error', message: errorMessage });
      }
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsValidating(false);
    }
  };
  
  return (
    <div className="bg-theme-card shadow sm:rounded-lg border border-theme-border">
      <div className="px-4 py-5 sm:p-6">
        <div className="mt-2 max-w-xl text-sm text-theme-fg opacity-80">
          <p>
            Describe your workout in natural language. Our AI will understand and organize it for you.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-5">
          <div className="w-full">
            <textarea
              id="workoutText"
              rows={5}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-theme-border rounded-md bg-theme-card text-theme-fg"
              placeholder="Example: Today I did 3 sets of bench press at 185lbs for 8 reps, followed by 3 sets of squats at 225lbs for 5 reps. I finished with a 20 minute run on the treadmill."
              {...register('workoutText', { 
                required: 'Please enter your workout details'
              })}
            />
            {errors.workoutText && (
              <p className="mt-2 text-sm text-red-500">{errors.workoutText.message}</p>
            )}
          </div>
          
          {feedback && (
            <div className={`mt-2 text-sm ${
              feedback.type === 'error' 
                ? 'text-red-500' 
                : feedback.type === 'subscription'
                  ? 'text-yellow-500'
                  : feedback.type === 'limit'
                    ? 'text-orange-500'
                    : 'text-green-500'
            }`}>
              {feedback.message}
              {feedback.type === 'subscription' && (
                <div className="mt-2">
                  <Link 
                    href="/account" 
                    className="text-indigo-500 hover:text-indigo-700 font-medium"
                  >
                    Subscribe now →
                  </Link>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-5">
            <button
              type="submit"
              disabled={isLoading || isValidating}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                (isLoading || isValidating) ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isValidating ? 'Validating...' : isLoading ? 'Processing...' : 'Save Workout'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 