import React from 'react';

interface WorkoutFormHeaderProps {
  register: any;
  errors: any;
}

const WorkoutFormHeader = ({ register, errors }: WorkoutFormHeaderProps) => {
  return (
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
  );
};

export default WorkoutFormHeader; 