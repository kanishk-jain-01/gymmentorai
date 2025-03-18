import React from 'react';
import { MinusIcon } from '@heroicons/react/24/outline';
import { SetEditorProps } from '@/types';

const SetEditor: React.FC<SetEditorProps> = ({ exerciseIndex, setIndex, register, removeSet }) => {
  return (
    <div 
      className="grid grid-cols-12 gap-3 items-center bg-theme-bg/40 p-3.5 rounded-xl border border-theme-border/30 group/set hover:shadow-sm transition-all duration-200"
    >
      <div className="col-span-1 text-xs font-medium text-theme-fg/70 text-center bg-theme-bg/70 rounded-full h-5 w-5 flex items-center justify-center mx-auto shadow-sm">
        {setIndex + 1}
      </div>
      
      <div className="col-span-2">
        <input
          type="number"
          className="block w-full rounded-lg border border-theme-border/50 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500/20 bg-theme-card text-theme-fg transition-all duration-200 placeholder:text-theme-fg/50 text-sm py-1.5 px-2"
          placeholder="Reps"
          {...register(`exercises.${exerciseIndex}.sets.${setIndex}.reps` as const, { valueAsNumber: true })}
        />
      </div>
      
      <div className="col-span-2">
        <input
          type="number"
          step="0.1"
          className="block w-full rounded-lg border border-theme-border/50 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500/20 bg-theme-card text-theme-fg transition-all duration-200 placeholder:text-theme-fg/50 text-sm py-1.5 px-2"
          placeholder="Weight"
          {...register(`exercises.${exerciseIndex}.sets.${setIndex}.weight` as const, { valueAsNumber: true })}
        />
      </div>
      
      <div className="col-span-2">
        <input
          type="text"
          className="block w-full rounded-lg border border-theme-border/50 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500/20 bg-theme-card text-theme-fg transition-all duration-200 placeholder:text-theme-fg/50 text-sm py-1.5 px-2"
          placeholder="MM:SS"
          {...register(`exercises.${exerciseIndex}.sets.${setIndex}.duration` as const)}
        />
      </div>
      
      <div className="col-span-2">
        <input
          type="number"
          step="0.1"
          className="block w-full rounded-lg border border-theme-border/50 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500/20 bg-theme-card text-theme-fg transition-all duration-200 placeholder:text-theme-fg/50 text-sm py-1.5 px-2"
          placeholder="Distance"
          {...register(`exercises.${exerciseIndex}.sets.${setIndex}.distance` as const, { valueAsNumber: true })}
        />
      </div>
      
      <div className="col-span-2">
        <input
          type="text"
          className="block w-full rounded-lg border border-theme-border/50 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500/20 bg-theme-card text-theme-fg transition-all duration-200 placeholder:text-theme-fg/50 text-sm py-1.5 px-2"
          placeholder="Notes"
          {...register(`exercises.${exerciseIndex}.sets.${setIndex}.notes` as const)}
        />
      </div>
      
      <div className="col-span-1 flex justify-center">
        <button
          type="button"
          onClick={() => removeSet(setIndex)}
          className="flex items-center justify-center h-6 w-6 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover/set:opacity-100 focus:opacity-100 transition-all duration-200 transform hover:scale-110 active:scale-95"
          aria-label="Remove set"
        >
          <MinusIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default SetEditor; 