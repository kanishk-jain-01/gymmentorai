import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import axios from 'axios';
import { Workout, WorkoutEditorProps } from '@/types';
import { formatDuration, parseDuration } from '@/lib/utils';
import WorkoutFormHeader from './WorkoutFormHeader';
import WorkoutFormActions from './WorkoutFormActions';
import ExerciseEditor from './ExerciseEditor';
import { useUnitPreferences } from '@/contexts/UnitPreferencesContext';
import { lbsToKg, kgToLbs, metersToMiles, metersToKm, milesToMeters, kmToMeters } from '@/lib/utils/unit-converter';

const WorkoutEditor: React.FC<WorkoutEditorProps> = ({ workout, onClose, onWorkoutUpdated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmState, setDeleteConfirmState] = useState(false);
  const { preferences } = useUnitPreferences();
  
  const { register, control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: workout.name || '',
      date: workout.date ? workout.date.split('T')[0] : '',
      duration: workout.duration || undefined,
      notes: workout.notes || '',
      exercises: workout.exercises.map(exercise => ({
        id: exercise.id,
        name: exercise.name,
        notes: exercise.notes || '',
        sets: exercise.sets.map(set => {
          // Convert weight and distance based on user preferences
          let weight = set.weight;
          if (weight && preferences.weightUnit === 'kg') {
            // Convert stored pounds to kg for display, rounded to 1 decimal
            weight = Number(lbsToKg(weight).toFixed(1));
          } else if (weight) {
            // For lb, also round to 1 decimal for consistency
            weight = Number(weight.toFixed(1));
          }
          
          let distance = set.distance;
          if (distance) {
            // Convert stored meters to user's preferred unit with appropriate rounding
            if (preferences.distanceUnit === 'mi') {
              distance = Number(metersToMiles(distance).toFixed(2));
            } else if (preferences.distanceUnit === 'km') {
              distance = Number(metersToKm(distance).toFixed(2));
            } else {
              // For meters, round to whole numbers
              distance = Math.round(distance);
            }
          }
          
          return {
            id: set.id,
            reps: set.reps || undefined,
            weight: weight || undefined,
            duration: set.duration ? formatDuration(set.duration) : '',
            distance: distance || undefined,
            notes: set.notes || '',
          };
        }),
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
      // Track original workout data to preserve precision
      const originalWorkout = workout;
      
      // Process the data before sending to API
      const processedData = {
        ...data,
        exercises: data.exercises.map((exercise: any, exerciseIndex: number) => ({
          ...exercise,
          sets: exercise.sets.map((set: any, setIndex: number) => {
            // Get original set if it exists (for unchanged values)
            const originalSet = originalWorkout.exercises[exerciseIndex]?.sets[setIndex];
            
            // Check if values have been modified by comparing with rounded original values
            const originalWeight = originalSet?.weight;
            const originalWeightFormatted = originalWeight && preferences.weightUnit === 'kg' 
              ? Number(lbsToKg(originalWeight).toFixed(1))
              : originalWeight ? Number(originalWeight.toFixed(1)) : undefined;
            
            const originalDistance = originalSet?.distance;
            const originalDistanceFormatted = originalDistance && preferences.distanceUnit === 'mi'
              ? Number(metersToMiles(originalDistance).toFixed(2))
              : originalDistance && preferences.distanceUnit === 'km'
              ? Number(metersToKm(originalDistance).toFixed(2))
              : originalDistance ? Math.round(originalDistance) : undefined;
            
            // Compare the current form values with the formatted original values
            const weightChanged = set.weight !== originalWeightFormatted;
            const distanceChanged = set.distance !== originalDistanceFormatted;
            
            // Handle unit conversions only if the values have changed
            let processedWeight = set.weight;
            if (processedWeight && preferences.weightUnit === 'kg' && weightChanged) {
              // Convert kg back to lb for storage
              processedWeight = kgToLbs(processedWeight);
            } else if (!weightChanged && originalSet) {
              // Use the original value if not changed
              processedWeight = originalSet.weight;
            }
            
            let processedDistance = set.distance;
            if (processedDistance && distanceChanged) {
              // Convert from user's unit back to meters for storage
              if (preferences.distanceUnit === 'mi') {
                processedDistance = milesToMeters(processedDistance);
              } else if (preferences.distanceUnit === 'km') {
                processedDistance = kmToMeters(processedDistance);
              }
            } else if (!distanceChanged && originalSet) {
              // Use the original value if not changed
              processedDistance = originalSet.distance;
            }
            
            // Parse duration
            const durationValue = set.duration ? parseDuration(set.duration) : undefined;
            const durationChanged = durationValue !== originalSet?.duration;
            const processDuration = durationChanged ? durationValue : originalSet?.duration;
            
            return {
              ...set,
              weight: processedWeight,
              distance: processedDistance,
              duration: processDuration,
            };
          }),
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
    <div className="fixed inset-0 overflow-y-auto h-full w-full z-50 flex items-center justify-center backdrop-blur-md bg-black/20 transition-all duration-300 ease-out">
      <div 
        className="relative bg-theme-card rounded-2xl shadow-[0_10px_60px_-15px_rgba(0,0,0,0.2)] max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-theme-border/30 transform transition-all duration-500 ease-out animate-fadeIn"
        style={{
          backgroundImage: 'linear-gradient(to bottom right, rgba(255,255,255,0.03), rgba(255,255,255,0))',
        }}
      >
        {/* Soft subtle gradients for depth */}
        <div className="absolute inset-0 bg-highlight rounded-2xl pointer-events-none -z-10"></div>
        
        {/* Header with thinner border and refined spacing */}
        <div className="px-8 py-6 border-b border-theme-border/30 flex justify-between items-center">
          <h3 className="text-xl font-medium text-theme-fg text-gradient-primary">Edit Workout</h3>
          <button
            onClick={onClose}
            className="text-theme-fg/70 hover:text-theme-fg transition-colors duration-200 hover:bg-theme-bg/50 rounded-full p-2"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-8 py-7 space-y-8">
            {error && (
              <div className="bg-error border border-error text-error px-4 py-3.5 rounded-xl flex items-center space-x-2.5 animate-fadeIn">
                <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            
            <WorkoutFormHeader register={register} errors={errors} />
            
            <div className="pt-3">
              <div className="flex justify-between items-center mb-5">
                <h4 className="text-lg font-medium text-theme-fg text-gradient-primary">Exercises</h4>
                <button
                  type="button"
                  onClick={addExercise}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-gradient-primary hover:bg-gradient-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500/50 transition-all duration-300 ease-out transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Exercise
                </button>
              </div>
              
              {exerciseFields.length === 0 ? (
                <div className="text-center py-14 text-theme-fg/60 bg-theme-bg/30 rounded-xl border border-dashed border-theme-border/50 transition-all duration-300 ease-out">
                  <svg className="mx-auto h-14 w-14 text-theme-fg/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.25} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="mt-3 text-sm font-medium">No exercises added yet</p>
                  <p className="mt-1 text-xs text-theme-fg/50">Click "Add Exercise" to start building your workout</p>
                </div>
              ) : (
                <div className="space-y-6">
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