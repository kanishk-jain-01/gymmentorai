import React from 'react';
import { MinusIcon } from '@heroicons/react/24/outline';
import { SetEditorProps } from '@/types';

const SetEditor: React.FC<SetEditorProps> = ({ exerciseIndex, setIndex, register, removeSet }) => {
  return (
    <div 
      className="grid grid-cols-12 gap-2 items-center bg-theme-bg/40 p-3 rounded-lg border border-theme-border/20 group/set"
    >
      <div className="col-span-1 text-xs font-medium text-theme-fg/70 text-center">
        {setIndex + 1}
      </div>
      
      <div className="col-span-2">
        <input
          type="number"
          className="block w-full rounded-md border-theme-border/50 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500/20 bg-theme-card text-theme-fg transition-all duration-200 placeholder:text-theme-fg/50 text-sm py-1"
          placeholder="Reps"
          {...register(`exercises.${exerciseIndex}.sets.${setIndex}.reps` as const, { valueAsNumber: true })}
        />
      </div>
      
      <div className="col-span-2">
        <input
          type="number"
          step="0.1"
          className="block w-full rounded-md border-theme-border/50 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500/20 bg-theme-card text-theme-fg transition-all duration-200 placeholder:text-theme-fg/50 text-sm py-1"
          placeholder="Weight"
          {...register(`exercises.${exerciseIndex}.sets.${setIndex}.weight` as const, { valueAsNumber: true })}
        />
      </div>
      
      <div className="col-span-2">
        <input
          type="text"
          className="block w-full rounded-md border-theme-border/50 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500/20 bg-theme-card text-theme-fg transition-all duration-200 placeholder:text-theme-fg/50 text-sm py-1"
          placeholder="Duration"
          {...register(`exercises.${exerciseIndex}.sets.${setIndex}.duration` as const)}
        />
      </div>
      
      <div className="col-span-2">
        <input
          type="number"
          step="0.1"
          className="block w-full rounded-md border-theme-border/50 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500/20 bg-theme-card text-theme-fg transition-all duration-200 placeholder:text-theme-fg/50 text-sm py-1"
          placeholder="Distance"
          {...register(`exercises.${exerciseIndex}.sets.${setIndex}.distance` as const, { valueAsNumber: true })}
        />
      </div>
      
      <div className="col-span-2">
        <input
          type="text"
          className="block w-full rounded-md border-theme-border/50 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500/20 bg-theme-card text-theme-fg transition-all duration-200 placeholder:text-theme-fg/50 text-sm py-1"
          placeholder="Notes"
          {...register(`exercises.${exerciseIndex}.sets.${setIndex}.notes` as const)}
        />
      </div>
      
      <div className="col-span-1 flex justify-center">
        <button
          type="button"
          onClick={() => removeSet(setIndex)}
          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 opacity-0 group-hover/set:opacity-100 focus:opacity-100 transition-opacity duration-200"
          aria-label="Remove set"
        >
          <MinusIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default SetEditor; 