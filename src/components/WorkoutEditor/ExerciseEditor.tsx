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
      className="border border-theme-border/30 rounded-lg p-5 relative bg-theme-bg/30 hover:bg-theme-bg/50 transition-all duration-200 group/exercise"
    >
      <div className="absolute -top-2 -right-2">
        <button
          type="button"
          onClick={() => removeExercise(exerciseIndex)}
          className="flex items-center justify-center h-6 w-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors duration-200 opacity-0 group-hover/exercise:opacity-100 focus:opacity-100"
          aria-label="Remove exercise"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
        <div className="md:col-span-2 group">
          <label className="block text-sm font-medium text-theme-fg/80 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors duration-200">
            Exercise Name
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="text"
              className="block w-full rounded-md border-theme-border/50 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500/20 bg-theme-card text-theme-fg transition-all duration-200 placeholder:text-theme-fg/50"
              placeholder="Exercise Name"
              {...register(`exercises.${exerciseIndex}.name` as const, { required: 'Exercise name is required' })}
            />
          </div>
          {errors.exercises?.[exerciseIndex]?.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400 animate-fadeIn">
              {errors.exercises[exerciseIndex]?.name?.message}
            </p>
          )}
        </div>
        
        <div className="md:col-span-2 group">
          <label className="block text-sm font-medium text-theme-fg/80 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors duration-200">
            Exercise Notes
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <textarea
              rows={2}
              className="block w-full rounded-md border-theme-border/50 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500/20 bg-theme-card text-theme-fg transition-all duration-200 placeholder:text-theme-fg/50 resize-none"
              placeholder="Exercise notes"
              {...register(`exercises.${exerciseIndex}.notes` as const)}
            />
          </div>
        </div>
      </div>
      
      {/* Sets Section */}
      <div className="mt-4 border-t border-theme-border/30 pt-4">
        <div className="flex justify-between items-center mb-3">
          <h5 className="text-sm font-medium text-theme-fg">Sets</h5>
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
            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-800/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
          >
            <PlusIcon className="h-3 w-3 mr-1" />
            Add Set
          </button>
        </div>
        
        {setFields.length === 0 ? (
          <div className="text-center py-3 text-theme-fg/60 bg-theme-bg/30 rounded-lg border border-dashed border-theme-border/50 text-xs">
            <p>No sets added. Click "Add Set" to add one.</p>
          </div>
        ) : (
          <div className="space-y-3">
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