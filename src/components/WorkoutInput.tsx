import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import Link from 'next/link';

interface FormData {
  workoutText: string;
}

interface WorkoutInputProps {
  onWorkoutAdded: () => void;
}

const LOCAL_STORAGE_KEY = 'workout-draft';

const WorkoutInput = ({ onWorkoutAdded }: WorkoutInputProps) => {
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
    subscriptionRequired?: boolean;
    message?: string;
  }> => {
    try {
      const response = await axios.post('/api/validate-workout', { text });
      const data = response.data;
      
      // Successful validation
      if (data.status === 'success') {
        return { isValid: data.isWorkoutRelated };
      }
      
      // All error cases handled with a consistent pattern
      const errorTypes: Record<string, { apiLimitExceeded?: boolean, subscriptionRequired?: boolean }> = {
        'subscription_required': { subscriptionRequired: true },
        'api_limit_exceeded': { apiLimitExceeded: true }
      };
      
      // Return appropriate error with original message from backend
      return {
        isValid: false,
        ...errorTypes[data.reason] || {},
        message: data.message
      };
    } catch (error: any) {
      console.error('Validation error:', error);
      return { 
        isValid: false,
        message: 'Failed to validate workout. Please try again.'
      };
    }
  };
  
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setFeedback(null);
    
    try {
      // First validate if the input is workout-related
      setIsValidating(true);
      const result = await validateWorkout(data.workoutText);
      setIsValidating(false);
      
      // Handle all error conditions from validation
      if (!result.isValid) {
        // Set the appropriate feedback type based on the validation result
        const feedbackType = result.subscriptionRequired ? 'subscription' :
                            result.apiLimitExceeded ? 'limit' : 'error';
        
        setFeedback({
          type: feedbackType,
          message: result.message || (
            feedbackType === 'error' ? 
              'Please enter a valid workout description. Random text or non-workout content is not allowed.' :
              `${feedbackType === 'subscription' ? 'Subscription' : 'API limit'} required`
          )
        });
        return;
      }
      
      // If valid, proceed with saving the workout
      const response = await axios.post('/api/workout', { text: data.workoutText });
      
      // Handle successful submission
      setFeedback({ type: 'success', message: 'Workout added successfully!' });
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      reset();
      onWorkoutAdded();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to add workout. Please try again.';
      setFeedback({ type: 'error', message: errorMessage });
      console.error(err);
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