import React from 'react';

interface WorkoutFormActionsProps {
  isLoading: boolean;
  deleteConfirmState: boolean;
  handleDeleteWorkout: () => void;
  onClose: () => void;
  setDeleteConfirmState: (state: boolean) => void;
}

const WorkoutFormActions: React.FC<WorkoutFormActionsProps> = ({
  isLoading,
  deleteConfirmState,
  handleDeleteWorkout,
  onClose,
  setDeleteConfirmState
}) => {
  return (
    <div className="border-t border-theme-border/30 px-8 py-5 bg-subtle rounded-b-2xl flex flex-wrap items-center justify-between gap-y-3">
      <div className="flex items-center space-x-3">
        {deleteConfirmState ? (
          <button
            type="button"
            onClick={handleDeleteWorkout}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-full text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500/50 transition-all duration-300 ease-out transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
            Confirm Delete
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setDeleteConfirmState(true)}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-full text-error border border-error hover:bg-error/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500/40 transition-all duration-300 ease-out transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
          >
            <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        )}
        
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-full text-theme-fg/80 border border-theme-border hover:bg-theme-bg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500/40 transition-all duration-300 ease-out transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
        >
          Cancel
        </button>
      </div>
      
      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex items-center px-5 py-2 text-sm font-medium rounded-full shadow-sm text-white bg-gradient-primary hover:bg-gradient-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500/50 transition-all duration-300 ease-out transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving...
          </>
        ) : (
          <>
            <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 13l4 4L19 7" />
            </svg>
            Save Workout
          </>
        )}
      </button>
    </div>
  );
};

export default WorkoutFormActions; 