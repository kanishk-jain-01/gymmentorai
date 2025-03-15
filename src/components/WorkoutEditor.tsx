import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import axios from 'axios';
import { Exercise, Workout } from '@/types';

interface WorkoutEditorProps {
  workout: Workout;
  onClose: () => void;
  onWorkoutUpdated: () => void;
}

export default function WorkoutEditor({ workout, onClose, onWorkoutUpdated }: WorkoutEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmState, setDeleteConfirmState] = useState(false);
  
  const { register, control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: workout.name || '',
      date: workout.date,
      duration: workout.duration || undefined,
      notes: workout.notes || '',
      exercises: workout.exercises.map(exercise => ({
        id: exercise.id,
        name: exercise.name,
        sets: exercise.sets || undefined,
        reps: exercise.reps || undefined,
        weight: exercise.weight || undefined,
        duration: exercise.duration || undefined,
        distance: exercise.distance || undefined,
        notes: exercise.notes || '',
      })),
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'exercises',
  });
  
  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await axios.put(`/api/workout/${workout.id}`, data);
      onWorkoutUpdated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update workout');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteWorkout = async () => {
    if (!deleteConfirmState) {
      setDeleteConfirmState(true);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await axios.delete(`/api/workout/${workout.id}`);
      onWorkoutUpdated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete workout');
      console.error(err);
    } finally {
      setIsLoading(false);
      setDeleteConfirmState(false);
    }
  };
  
  const addExercise = () => {
    append({
      id: '',
      name: '',
      sets: undefined,
      reps: undefined,
      weight: undefined,
      duration: undefined,
      distance: undefined,
      notes: '',
    });
  };
  
  return (
    <div className="fixed inset-0 overflow-y-auto h-full w-full z-50 flex items-center justify-center pointer-events-none backdrop-blur-sm bg-black/30 dark:bg-black/50">
      <div className="relative bg-theme-card rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto pointer-events-auto border border-theme-border/30 transform transition-all duration-300 ease-in-out animate-fadeIn">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent rounded-xl -z-10"></div>
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-theme-border/30 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-theme-fg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">Edit Workout</h3>
          <button
            onClick={onClose}
            className="text-theme-fg/70 hover:text-theme-fg transition-colors duration-200 hover:bg-theme-bg/50 rounded-full p-2"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-8 py-6 space-y-8">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg flex items-center space-x-2 animate-fadeIn">
                <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label htmlFor="name" className="block text-sm font-medium text-theme-fg/80 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors duration-200">
                  Workout Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="text"
                    id="name"
                    className="block w-full rounded-md border-theme-border/50 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500/20 bg-theme-card text-theme-fg transition-all duration-200 placeholder:text-theme-fg/50"
                    placeholder="Workout Name"
                    {...register('name')}
                  />
                </div>
              </div>
              
              <div className="group">
                <label htmlFor="date" className="block text-sm font-medium text-theme-fg/80 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors duration-200">
                  Date
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="date"
                    id="date"
                    className="block w-full rounded-md border-theme-border/50 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500/20 bg-theme-card text-theme-fg transition-all duration-200"
                    {...register('date')}
                  />
                </div>
              </div>
              
              <div className="group">
                <label htmlFor="duration" className="block text-sm font-medium text-theme-fg/80 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors duration-200">
                  Duration (minutes)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    id="duration"
                    className="block w-full rounded-md border-theme-border/50 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500/20 bg-theme-card text-theme-fg transition-all duration-200 placeholder:text-theme-fg/50"
                    placeholder="Duration in minutes"
                    {...register('duration', { valueAsNumber: true })}
                  />
                </div>
              </div>
              
              <div className="md:col-span-2 group">
                <label htmlFor="notes" className="block text-sm font-medium text-theme-fg/80 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors duration-200">
                  Notes
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <textarea
                    id="notes"
                    rows={2}
                    className="block w-full rounded-md border-theme-border/50 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500/20 bg-theme-card text-theme-fg transition-all duration-200 placeholder:text-theme-fg/50 resize-none"
                    placeholder="Workout notes"
                    {...register('notes')}
                  />
                </div>
              </div>
            </div>
            
            <div className="pt-2">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-theme-fg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">Exercises</h4>
                <button
                  type="button"
                  onClick={addExercise}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105"
                >
                  <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Exercise
                </button>
              </div>
              
              {fields.length === 0 ? (
                <div className="text-center py-10 text-theme-fg/60 bg-theme-bg/30 rounded-lg border border-dashed border-theme-border/50">
                  <svg className="mx-auto h-12 w-12 text-theme-fg/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="mt-2 text-sm">No exercises added. Click "Add Exercise" to add one.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {fields.map((field, index) => (
                    <div 
                      key={field.id} 
                      className="border border-theme-border/30 rounded-lg p-5 relative bg-theme-bg/30 hover:bg-theme-bg/50 transition-all duration-200 group/exercise"
                    >
                      <div className="absolute -top-2 -right-2">
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="flex items-center justify-center h-6 w-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors duration-200 opacity-0 group-hover/exercise:opacity-100 focus:opacity-100"
                          aria-label="Remove exercise"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2 group">
                          <label className="block text-sm font-medium text-theme-fg/80 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors duration-200">
                            Exercise Name
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <input
                              type="text"
                              className="block w-full rounded-md border-theme-border/50 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500/20 bg-theme-card text-theme-fg transition-all duration-200 placeholder:text-theme-fg/50"
                              placeholder="Exercise Name"
                              {...register(`exercises.${index}.name` as const, { required: 'Exercise name is required' })}
                            />
                          </div>
                          {errors.exercises?.[index]?.name && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400 animate-fadeIn">
                              {errors.exercises[index]?.name?.message}
                            </p>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-5">
                          <div className="group">
                            <label className="block text-sm font-medium text-theme-fg/80 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors duration-200">
                              Sets
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                              <input
                                type="number"
                                className="block w-full rounded-md border-theme-border/50 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500/20 bg-theme-card text-theme-fg transition-all duration-200 placeholder:text-theme-fg/50"
                                placeholder="Sets"
                                {...register(`exercises.${index}.sets` as const, { valueAsNumber: true })}
                              />
                            </div>
                          </div>
                          
                          <div className="group">
                            <label className="block text-sm font-medium text-theme-fg/80 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors duration-200">
                              Reps
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                              <input
                                type="number"
                                className="block w-full rounded-md border-theme-border/50 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500/20 bg-theme-card text-theme-fg transition-all duration-200 placeholder:text-theme-fg/50"
                                placeholder="Reps"
                                {...register(`exercises.${index}.reps` as const, { valueAsNumber: true })}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-5">
                          <div className="group">
                            <label className="block text-sm font-medium text-theme-fg/80 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors duration-200">
                              Weight (lbs)
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                              <input
                                type="number"
                                step="0.1"
                                className="block w-full rounded-md border-theme-border/50 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500/20 bg-theme-card text-theme-fg transition-all duration-200 placeholder:text-theme-fg/50"
                                placeholder="Weight"
                                {...register(`exercises.${index}.weight` as const, { valueAsNumber: true })}
                              />
                            </div>
                          </div>
                          
                          <div className="group">
                            <label className="block text-sm font-medium text-theme-fg/80 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors duration-200">
                              Duration (sec)
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                              <input
                                type="number"
                                className="block w-full rounded-md border-theme-border/50 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500/20 bg-theme-card text-theme-fg transition-all duration-200 placeholder:text-theme-fg/50"
                                placeholder="Duration"
                                {...register(`exercises.${index}.duration` as const, { valueAsNumber: true })}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="group">
                          <label className="block text-sm font-medium text-theme-fg/80 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors duration-200">
                            Distance (miles)
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <input
                              type="number"
                              step="0.1"
                              className="block w-full rounded-md border-theme-border/50 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500/20 bg-theme-card text-theme-fg transition-all duration-200 placeholder:text-theme-fg/50"
                              placeholder="Distance"
                              {...register(`exercises.${index}.distance` as const, { valueAsNumber: true })}
                            />
                          </div>
                        </div>
                        
                        <div className="md:col-span-2 group">
                          <label className="block text-sm font-medium text-theme-fg/80 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors duration-200">
                            Notes
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <textarea
                              rows={2}
                              className="block w-full rounded-md border-theme-border/50 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500/20 bg-theme-card text-theme-fg transition-all duration-200 placeholder:text-theme-fg/50 resize-none"
                              placeholder="Exercise notes"
                              {...register(`exercises.${index}.notes` as const)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="px-8 py-5 bg-theme-bg/50 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 rounded-b-xl border-t border-theme-border/30">
            <button
              type="button"
              onClick={handleDeleteWorkout}
              disabled={isLoading}
              className={`inline-flex items-center justify-center py-2 px-4 border shadow-sm text-sm font-medium rounded-full transition-all duration-300 ease-in-out w-full sm:w-auto ${
                deleteConfirmState 
                  ? 'border-red-500 text-white bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                  : 'border-red-300 text-red-700 dark:text-red-400 bg-white dark:bg-red-900/20 hover:bg-red-50 dark:hover:bg-red-900/40 focus:ring-red-500'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:scale-105`}
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : deleteConfirmState ? (
                <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              ) : (
                <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
              {isLoading ? 'Deleting...' : deleteConfirmState ? 'Confirm Delete' : 'Delete Workout'}
            </button>
            
            <div className="flex w-full sm:w-auto space-x-3">
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmState(false);
                  onClose();
                }}
                className="inline-flex items-center justify-center py-2 px-4 border border-theme-border/50 text-theme-fg bg-theme-card hover:bg-theme-bg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-full transition-all duration-200 transform hover:scale-105 flex-1 sm:flex-initial"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`inline-flex items-center justify-center py-2 px-5 border border-transparent shadow-sm text-sm font-medium rounded-full text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105 flex-1 sm:flex-initial ${
                  isLoading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 