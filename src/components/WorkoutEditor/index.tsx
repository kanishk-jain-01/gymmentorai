import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import axios from 'axios';
import { Workout, WorkoutEditorProps } from '@/types';
import { formatDuration, parseDuration } from '@/lib/utils';
import WorkoutFormHeader from './WorkoutFormHeader';
import WorkoutFormActions from './WorkoutFormActions';
import ExerciseEditor from './ExerciseEditor';

const WorkoutEditor: React.FC<WorkoutEditorProps> = ({ workout, onClose, onWorkoutUpdated }) => {
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
        notes: exercise.notes || '',
        sets: exercise.sets.map(set => ({
          id: set.id,
          reps: set.reps || undefined,
          weight: set.weight || undefined,
          duration: set.duration ? formatDuration(set.duration) : '',
          distance: set.distance || undefined,
          notes: set.notes || '',
        })),
      })),
    },
  });
  
  const { fields: exerciseFields, append: appendExercise, remove: removeExercise } = useFieldArray({
    control,
    name: 'exercises',
  });
  
  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Convert MM:SS duration format to seconds before sending to API
      const processedData = {
        ...data,
        exercises: data.exercises.map((exercise: any) => ({
          ...exercise,
          sets: exercise.sets.map((set: any) => ({
            ...set,
            duration: set.duration ? parseDuration(set.duration) : undefined,
          })),
        })),
      };
      
      await axios.put(`/api/workout/${workout.id}`, processedData);
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
    appendExercise({
      id: '',
      name: '',
      notes: '',
      sets: [{
        id: '',
        reps: undefined,
        weight: undefined,
        duration: '',
        distance: undefined,
        notes: '',
      }],
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
            
            <WorkoutFormHeader register={register} errors={errors} />
            
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
              
              {exerciseFields.length === 0 ? (
                <div className="text-center py-10 text-theme-fg/60 bg-theme-bg/30 rounded-lg border border-dashed border-theme-border/50">
                  <svg className="mx-auto h-12 w-12 text-theme-fg/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="mt-2 text-sm">No exercises added. Click "Add Exercise" to add one.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {exerciseFields.map((exerciseField, exerciseIndex) => (
                    <ExerciseEditor
                      key={exerciseField.id}
                      exerciseIndex={exerciseIndex}
                      control={control}
                      register={register}
                      errors={errors}
                      removeExercise={removeExercise}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <WorkoutFormActions 
            isLoading={isLoading}
            deleteConfirmState={deleteConfirmState}
            handleDeleteWorkout={handleDeleteWorkout}
            onClose={onClose}
            setDeleteConfirmState={setDeleteConfirmState}
          />
        </form>
      </div>
    </div>
  );
};

export default WorkoutEditor; 