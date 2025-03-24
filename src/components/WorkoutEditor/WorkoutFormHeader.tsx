import React from 'react';

interface WorkoutFormHeaderProps {
  register: any;
  errors: any;
}

const WorkoutFormHeader: React.FC<WorkoutFormHeaderProps> = ({ register, errors }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="group">
        <label htmlFor="name" className="block text-sm font-medium text-theme-fg/80 group-focus-within:text-primary transition-colors duration-200">
          Workout Name
        </label>
        <div className="mt-1.5 relative rounded-md">
          <input
            type="text"
            id="name"
            className="block w-full rounded-xl border border-subtle shadow-sm focus:border-primary focus:ring focus:ring-indigo-500/20 bg-theme-card text-theme-fg transition-all duration-200 placeholder:text-theme-fg/50 py-2.5 px-3.5"
            placeholder="Enter workout name"
            {...register('name')}
          />
        </div>
      </div>
      
      <div className="group">
        <label htmlFor="date" className="block text-sm font-medium text-theme-fg/80 group-focus-within:text-primary transition-colors duration-200">
          Date
        </label>
        <div className="mt-1.5 relative rounded-md">
          <input
            type="date"
            id="date"
            className="block w-full rounded-xl border border-subtle shadow-sm focus:border-primary focus:ring focus:ring-indigo-500/20 bg-theme-card text-theme-fg transition-all duration-200 py-2.5 px-3.5"
            {...register('date')}
          />
        </div>
      </div>
      
      <div className="group">
        <label htmlFor="duration" className="block text-sm font-medium text-theme-fg/80 group-focus-within:text-primary transition-colors duration-200">
          Duration (minutes)
        </label>
        <div className="mt-1.5 relative rounded-md">
          <input
            type="number"
            id="duration"
            className="block w-full rounded-xl border border-subtle shadow-sm focus:border-primary focus:ring focus:ring-indigo-500/20 bg-theme-card text-theme-fg transition-all duration-200 placeholder:text-theme-fg/50 py-2.5 px-3.5"
            placeholder="Duration in minutes"
            {...register('duration', { valueAsNumber: true })}
          />
        </div>
      </div>
      
      <div className="md:col-span-2 group">
        <label htmlFor="notes" className="block text-sm font-medium text-theme-fg/80 group-focus-within:text-primary transition-colors duration-200">
          Notes
        </label>
        <div className="mt-1.5 relative rounded-md">
          <textarea
            id="notes"
            rows={3}
            className="block w-full rounded-xl border border-subtle shadow-sm focus:border-primary focus:ring focus:ring-indigo-500/20 bg-theme-card text-theme-fg transition-all duration-200 placeholder:text-theme-fg/50 resize-none py-2.5 px-3.5"
            placeholder="Add any notes about this workout"
            {...register('notes')}
          />
        </div>
      </div>
    </div>
  );
};

export default WorkoutFormHeader; 