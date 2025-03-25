import React from 'react';
import { MinusIcon } from '@heroicons/react/24/outline';
import { useUnitPreferences } from '@/contexts/UnitPreferencesContext';

interface SetEditorProps {
  exerciseIndex: number;
  setIndex: number;
  register: any;
  removeSet: (index: number) => void;
}

const SetEditor: React.FC<SetEditorProps> = ({ exerciseIndex, setIndex, register, removeSet }) => {
  const { preferences } = useUnitPreferences();
  
  // Determine step values based on unit preference
  const weightStep = preferences.weightUnit === 'kg' ? 0.1 : 0.1;
  const distanceStep = preferences.distanceUnit === 'm' ? 1 : 0.01;

  // Create stable field names to avoid regeneration issues on mobile
  const repsField = `exercises.${exerciseIndex}.sets.${setIndex}.reps`;
  const weightField = `exercises.${exerciseIndex}.sets.${setIndex}.weight`;
  const durationField = `exercises.${exerciseIndex}.sets.${setIndex}.duration`;
  const distanceField = `exercises.${exerciseIndex}.sets.${setIndex}.distance`;
  const notesField = `exercises.${exerciseIndex}.sets.${setIndex}.notes`;
  
  // Handle removal with a wrapper to prevent mobile event issues
  const handleRemoveSet = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeSet(setIndex);
  };
  
  return (
    <div 
      className="bg-subtle p-3.5 rounded-xl border border-subtle group/set hover:shadow-sm transition-all duration-200"
      data-exercise-index={exerciseIndex}
      data-set-index={setIndex}
    >
      {/* Mobile Layout (default) - Stack vertically */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-medium text-theme-fg/70 text-center bg-theme-bg/70 rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
            {setIndex + 1}
          </div>
          
          <button
            type="button"
            onClick={handleRemoveSet}
            className="flex items-center justify-center h-6 w-6 rounded-full text-error hover:text-red-600 hover:bg-red-50 transition-all duration-200 transform hover:scale-110 active:scale-95"
            aria-label="Remove set"
          >
            <MinusIcon className="h-3.5 w-3.5" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-theme-fg/60 mb-1" htmlFor={`mobile-reps-${exerciseIndex}-${setIndex}`}>Reps</label>
            <input
              id={`mobile-reps-${exerciseIndex}-${setIndex}`}
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              className="block w-full rounded-lg border border-subtle shadow-sm focus:border-primary focus:ring focus:ring-indigo-500/20 bg-theme-card text-theme-fg transition-all duration-200 placeholder:text-theme-fg/50 text-sm py-1.5 px-2"
              placeholder="Reps"
              {...register(repsField, { 
                setValueAs: v => v === "" || v === null ? undefined : Number(v)
              })}
            />
          </div>
          
          <div>
            <label className="block text-xs text-theme-fg/60 mb-1" htmlFor={`mobile-weight-${exerciseIndex}-${setIndex}`}>Weight</label>
            <input
              id={`mobile-weight-${exerciseIndex}-${setIndex}`}
              type="number"
              inputMode="decimal"
              step={weightStep}
              className="block w-full rounded-lg border border-subtle shadow-sm focus:border-primary focus:ring focus:ring-indigo-500/20 bg-theme-card text-theme-fg transition-all duration-200 placeholder:text-theme-fg/50 text-sm py-1.5 px-2"
              placeholder={preferences.weightUnit}
              {...register(weightField, { 
                setValueAs: v => v === "" || v === null ? undefined : Number(v)
              })}
            />
          </div>
          
          <div>
            <label className="block text-xs text-theme-fg/60 mb-1" htmlFor={`mobile-duration-${exerciseIndex}-${setIndex}`}>Duration</label>
            <input
              id={`mobile-duration-${exerciseIndex}-${setIndex}`}
              type="text"
              className="block w-full rounded-lg border border-subtle shadow-sm focus:border-primary focus:ring focus:ring-indigo-500/20 bg-theme-card text-theme-fg transition-all duration-200 placeholder:text-theme-fg/50 text-sm py-1.5 px-2"
              placeholder="MM:SS"
              {...register(durationField)}
            />
          </div>
          
          <div>
            <label className="block text-xs text-theme-fg/60 mb-1" htmlFor={`mobile-distance-${exerciseIndex}-${setIndex}`}>Distance</label>
            <input
              id={`mobile-distance-${exerciseIndex}-${setIndex}`}
              type="number"
              inputMode="decimal"
              step={distanceStep}
              className="block w-full rounded-lg border border-subtle shadow-sm focus:border-primary focus:ring focus:ring-indigo-500/20 bg-theme-card text-theme-fg transition-all duration-200 placeholder:text-theme-fg/50 text-sm py-1.5 px-2"
              placeholder={preferences.distanceUnit}
              {...register(distanceField, { 
                setValueAs: v => v === "" || v === null ? undefined : Number(v)
              })}
            />
          </div>
        </div>
        
        <div className="mt-2">
          <label className="block text-xs text-theme-fg/60 mb-1" htmlFor={`mobile-notes-${exerciseIndex}-${setIndex}`}>Notes</label>
          <input
            id={`mobile-notes-${exerciseIndex}-${setIndex}`}
            type="text"
            className="block w-full rounded-lg border border-subtle shadow-sm focus:border-primary focus:ring focus:ring-indigo-500/20 bg-theme-card text-theme-fg transition-all duration-200 placeholder:text-theme-fg/50 text-sm py-1.5 px-2"
            placeholder="Notes"
            {...register(notesField)}
          />
        </div>
      </div>
      
      {/* Desktop Layout - Grid */}
      <div className="hidden md:grid md:grid-cols-12 md:gap-3 md:items-center">
        <div className="col-span-1 text-xs font-medium text-theme-fg/70 text-center bg-theme-bg/70 rounded-full h-5 w-5 flex items-center justify-center mx-auto shadow-sm">
          {setIndex + 1}
        </div>
        
        <div className="col-span-2">
          <input
            type="number"
            inputMode="numeric"
            className="block w-full rounded-lg border border-subtle shadow-sm focus:border-primary focus:ring focus:ring-indigo-500/20 bg-theme-card text-theme-fg transition-all duration-200 placeholder:text-theme-fg/50 text-sm py-1.5 px-2"
            placeholder="Reps"
            {...register(repsField, { 
              setValueAs: v => v === "" || v === null ? undefined : Number(v)
            })}
          />
        </div>
        
        <div className="col-span-2">
          <input
            type="number"
            inputMode="decimal"
            step={weightStep}
            className="block w-full rounded-lg border border-subtle shadow-sm focus:border-primary focus:ring focus:ring-indigo-500/20 bg-theme-card text-theme-fg transition-all duration-200 placeholder:text-theme-fg/50 text-sm py-1.5 px-2"
            placeholder={`Weight (${preferences.weightUnit})`}
            {...register(weightField, { 
              setValueAs: v => v === "" || v === null ? undefined : Number(v)
            })}
          />
        </div>
        
        <div className="col-span-2">
          <input
            type="text"
            className="block w-full rounded-lg border border-subtle shadow-sm focus:border-primary focus:ring focus:ring-indigo-500/20 bg-theme-card text-theme-fg transition-all duration-200 placeholder:text-theme-fg/50 text-sm py-1.5 px-2"
            placeholder="MM:SS"
            {...register(durationField)}
          />
        </div>
        
        <div className="col-span-2">
          <input
            type="number"
            inputMode="decimal"
            step={distanceStep}
            className="block w-full rounded-lg border border-subtle shadow-sm focus:border-primary focus:ring focus:ring-indigo-500/20 bg-theme-card text-theme-fg transition-all duration-200 placeholder:text-theme-fg/50 text-sm py-1.5 px-2"
            placeholder={`Distance (${preferences.distanceUnit})`}
            {...register(distanceField, { 
              setValueAs: v => v === "" || v === null ? undefined : Number(v)
            })}
          />
        </div>
        
        <div className="col-span-2">
          <input
            type="text"
            className="block w-full rounded-lg border border-subtle shadow-sm focus:border-primary focus:ring focus:ring-indigo-500/20 bg-theme-card text-theme-fg transition-all duration-200 placeholder:text-theme-fg/50 text-sm py-1.5 px-2"
            placeholder="Notes"
            {...register(notesField)}
          />
        </div>
        
        <div className="col-span-1 flex justify-center">
          <button
            type="button"
            onClick={handleRemoveSet}
            className="flex items-center justify-center h-6 w-6 rounded-full text-error hover:text-red-600 hover:bg-red-50 opacity-0 group-hover/set:opacity-100 focus:opacity-100 transition-all duration-200 transform hover:scale-110 active:scale-95"
            aria-label="Remove set"
          >
            <MinusIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetEditor; 