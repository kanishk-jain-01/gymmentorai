import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import Link from 'next/link';
import { WorkoutInputProps } from '@/types';

interface FormData {
  workoutText: string;
}

const LOCAL_STORAGE_KEY = 'workout-draft';

const WorkoutInput: React.FC<WorkoutInputProps> = ({ onWorkoutAdded }) => {
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
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>();
  
  const workoutText = watch('workoutText');
  
  // Load draft from localStorage on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedDraft) {
      setValue('workoutText', savedDraft);
    }
  }, [setValue]);
  
  // Save draft to localStorage whenever workoutText changes
  useEffect(() => {
    if (workoutText) {
      localStorage.setItem(LOCAL_STORAGE_KEY, workoutText);
    }
  }, [workoutText]);
  
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
        // Form data is preserved when API limit is exceeded
        return;
      }
      
      if (!validationResult.isValid) {
        setFeedback({ 
          type: 'error', 
          message: 'Please enter a valid workout description. Random text or non-workout content is not allowed.' 
        });
        // Form data is preserved when validation fails
        return;
      }
      
      // If valid, proceed with saving the workout
      const response = await axios.post('/api/workout', { text: data.workoutText });
      setFeedback({ 
        type: 'success', 
        message: 'Workout added successfully!'
      });
      
      // Clear the localStorage draft after successful submission
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      
      // Only reset the form when submission is successful
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
      // Don't reset the form or clear localStorage when there's an error
    } finally {
      setIsLoading(false);
      setIsValidating(false);
    }
  };
  
  return (
    <div className="bg-theme-card shadow sm:rounded-lg border border-theme-border hover:border-subtle transition-colors duration-200">
      <div className="px-4 py-5 sm:p-6">
        <div className="mt-2 max-w-xl text-sm text-theme-fg opacity-80">
          <p>
            Describe your workout in natural language. 
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-5">
          <div className="w-full mt-1.5 relative">
            <textarea
              id="workoutText"
              rows={5}
              className="block w-full rounded-xl border border-subtle shadow-sm focus:border-primary-from focus:ring focus:ring-primary-from/20 bg-subtle text-theme-fg transition-all duration-200 placeholder:text-theme-fg/50 py-2.5 px-3.5"
              placeholder="Example: Today I did 3 sets of bench press at 185lbs for 8 reps, followed by 3 sets of squats at 225lbs for 5 reps. I finished with a 20 minute run on the treadmill."
              {...register('workoutText', { 
                required: 'Please enter your workout details'
              })}
            />
            {errors.workoutText && (
              <p className="mt-2 text-sm text-error">{errors.workoutText.message}</p>
            )}
          </div>
          
          {feedback && (
            <div className={`mt-2 text-sm p-2 rounded ${
              feedback.type === 'error' 
                ? 'text-error bg-error border border-error' 
                : feedback.type === 'subscription'
                  ? 'text-yellow-500 bg-yellow-50/80 dark:bg-yellow-900/20 border border-yellow-200/70 dark:border-yellow-800/30'
                  : feedback.type === 'limit'
                    ? 'text-orange-500 bg-orange-50/80 dark:bg-orange-900/20 border border-orange-200/70 dark:border-orange-800/30'
                    : 'text-green-500 bg-green-50/80 dark:bg-green-900/20 border border-green-200/70 dark:border-green-800/30'
            }`}>
              {feedback.message}
              {feedback.type === 'subscription' && (
                <div className="mt-2">
                  <Link 
                    href="/account" 
                    className="text-primary font-medium hover:text-gradient-primary transition-all duration-200"
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
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-primary hover:bg-gradient-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-from transition-all duration-200 ${
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

export default WorkoutInput; 