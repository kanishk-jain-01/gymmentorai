import React from 'react';
import { useFieldArray } from 'react-hook-form';
import { PlusIcon } from '@heroicons/react/24/outline';
import SetEditor from './SetEditor';
import { ExerciseEditorProps } from '@/types';

const ExerciseEditor: React.FC<ExerciseEditorProps> = ({ exerciseIndex, control, register, errors, removeExercise }) => {
  const { fields: setFields, append: appendSet, remove: removeSet } = useFieldArray({
    control: control,
    name: `exercises.${exerciseIndex}.sets`,
  });

  return (
    <div 
      className="border border-theme-border/30 rounded-xl p-6 relative bg-theme-card hover:bg-theme-card transition-all duration-200 group/exercise shadow-sm hover:shadow-md"
    >
      <div className="absolute -top-2 -right-2">
        <button
          type="button"
          onClick={() => removeExercise(exerciseIndex)}
          className="flex items-center justify-center h-7 w-7 rounded-full bg-red-100/90 text-red-500 hover:bg-red-200 transition-all duration-200 opacity-0 group-hover/exercise:opacity-100 focus:opacity-100 shadow-sm transform hover:scale-110 active:scale-95"
          aria-label="Remove exercise"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div className="md:col-span-2 group">
          <label className="block text-sm font-medium text-theme-fg/80 group-focus-within:text-indigo-500 transition-colors duration-200">
            Exercise Name
          </label>
          <div className="mt-1.5 relative rounded-md">
            <input
              type="text"
              className="block w-full rounded-xl border border-theme-border/70 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500/20 bg-theme-card text-theme-fg transition-all duration-200 placeholder:text-theme-fg/50 py-2.5 px-3.5"
              placeholder="Enter exercise name"
              {...register(`exercises.${exerciseIndex}.name` as const, { required: 'Exercise name is required' })}
            />
          </div>
          {errors.exercises?.[exerciseIndex]?.name && (
            <p className="mt-1.5 text-sm text-red-500 animate-fadeIn flex items-center">
              <svg className="h-4 w-4 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {errors.exercises[exerciseIndex]?.name?.message}
            </p>
          )}
        </div>
        
        <div className="md:col-span-2 group">
          <label className="block text-sm font-medium text-theme-fg/80 group-focus-within:text-indigo-500 transition-colors duration-200">
            Exercise Notes
          </label>
          <div className="mt-1.5 relative rounded-md">
            <textarea
              rows={2}
              className="block w-full rounded-xl border border-theme-border/70 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500/20 bg-theme-card text-theme-fg transition-all duration-200 placeholder:text-theme-fg/50 resize-none py-2.5 px-3.5"
              placeholder="Add notes for this exercise (optional)"
              {...register(`exercises.${exerciseIndex}.notes` as const)}
            />
          </div>
        </div>
      </div>
      
      {/* Sets Section */}
      <div className="pt-4 border-t border-theme-border/30">
        <div className="flex justify-between items-center mb-4">
          <h5 className="text-sm font-medium text-theme-fg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Sets
          </h5>
          <button
            type="button"
            onClick={() => appendSet({
              id: '',
              reps: undefined,
              weight: undefined,
              duration: '',
              distance: undefined,
              notes: '',
            })}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500/50 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm"
          >
            <PlusIcon className="h-3.5 w-3.5 mr-1" />
            Add Set
          </button>
        </div>
        
        {setFields.length === 0 ? (
          <div className="text-center py-4 text-theme-fg/60 bg-theme-bg/30 rounded-xl border border-dashed border-theme-border/50 text-xs transition-all duration-200">
            <p>No sets added yet. Click "Add Set" to track your performance.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {setFields.map((setField, setIndex) => (
              <SetEditor 
                key={setField.id}
                exerciseIndex={exerciseIndex}
                setIndex={setIndex}
                register={register}
                removeSet={removeSet}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseEditor; 