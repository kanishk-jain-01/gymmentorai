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
    <div className="fixed inset-0 overflow-y-auto h-full w-full z-50 flex items-center justify-center pointer-events-none">
      <div className="relative bg-theme-card rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto pointer-events-auto border border-theme-border transform transition-all duration-300 ease-in-out">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-blue-50 opacity-50 rounded-lg -z-10"></div>
        <div className="px-6 py-4 border-b border-theme-border">
          <h3 className="text-lg font-medium text-theme-fg">Edit Workout</h3>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-theme-fg"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 py-4 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-theme-fg">
                  Workout Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Workout Name"
                  {...register('name')}
                />
              </div>
              
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-theme-fg">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  {...register('date')}
                />
              </div>
              
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-theme-fg">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  id="duration"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Duration in minutes"
                  {...register('duration', { valueAsNumber: true })}
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-theme-fg">
                  Notes
                </label>
                <textarea
                  id="notes"
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Workout notes"
                  {...register('notes')}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-base font-medium text-theme-fg">Exercises</h4>
                <button
                  type="button"
                  onClick={addExercise}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Exercise
                </button>
              </div>
              
              {fields.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No exercises added. Click "Add Exercise" to add one.
                </div>
              ) : (
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="border border-gray-200 rounded-md p-4 relative">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-500"
                      >
                        <span className="sr-only">Remove</span>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-theme-fg">
                            Exercise Name
                          </label>
                          <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="Exercise Name"
                            {...register(`exercises.${index}.name` as const, { required: 'Exercise name is required' })}
                          />
                          {errors.exercises?.[index]?.name && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.exercises[index]?.name?.message}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-theme-fg">
                            Sets
                          </label>
                          <input
                            type="number"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="Number of sets"
                            {...register(`exercises.${index}.sets` as const, { valueAsNumber: true })}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-theme-fg">
                            Reps
                          </label>
                          <input
                            type="number"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="Number of reps"
                            {...register(`exercises.${index}.reps` as const, { valueAsNumber: true })}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-theme-fg">
                            Weight (lbs)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="Weight in lbs"
                            {...register(`exercises.${index}.weight` as const, { valueAsNumber: true })}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-theme-fg">
                            Duration (seconds)
                          </label>
                          <input
                            type="number"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="Duration in seconds"
                            {...register(`exercises.${index}.duration` as const, { valueAsNumber: true })}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-theme-fg">
                            Distance (miles)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="Distance in miles"
                            {...register(`exercises.${index}.distance` as const, { valueAsNumber: true })}
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-theme-fg">
                            Notes
                          </label>
                          <textarea
                            rows={2}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="Exercise notes"
                            {...register(`exercises.${index}.notes` as const)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 flex justify-between items-center rounded-b-lg">
            <button
              type="button"
              onClick={handleDeleteWorkout}
              disabled={isLoading}
              className={`inline-flex justify-center py-2 px-4 border shadow-sm text-sm font-medium rounded-md transition-all duration-300 ease-in-out ${
                deleteConfirmState 
                  ? 'border-red-500 text-white bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                  : 'border-red-300 text-red-700 bg-white hover:bg-red-50 focus:ring-red-500'
              } focus:outline-none focus:ring-2 focus:ring-offset-2`}
            >
              {isLoading ? 'Deleting...' : deleteConfirmState ? 'Confirm Delete' : 'Delete Workout'}
            </button>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmState(false);
                  onClose();
                }}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  isLoading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 