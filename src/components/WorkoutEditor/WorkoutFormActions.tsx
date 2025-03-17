import React from 'react';

interface WorkoutFormActionsProps {
  isLoading: boolean;
  deleteConfirmState: boolean;
  handleDeleteWorkout: () => void;
  onClose: () => void;
  setDeleteConfirmState: (state: boolean) => void;
}

const WorkoutFormActions = ({ 
  isLoading, 
  deleteConfirmState, 
  handleDeleteWorkout, 
  onClose, 
  setDeleteConfirmState 
}: WorkoutFormActionsProps) => {
  return (
    <div className="px-8 py-5 bg-theme-bg/50 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 rounded-b-xl border-t border-theme-border/30">
      <button
        type="button"
        onClick={handleDeleteWorkout}
        disabled={isLoading}
        className={`inline-flex items-center justify-center py-2 px-4 border shadow-sm text-sm font-medium rounded-full transition-all duration-300 ease-in-out w-full sm:w-auto ${
          deleteConfirmState 
            ? 'border-red-500 text-white bg-red-600 hover:bg-red-700 focus:ring-red-500' 
            : 'border-red-300 text-red-700 dark:text-red-400 bg-white dark:bg-red-900/20 hover:bg-red-50 dark:hover:bg-red-900/40 focus:ring-red-500'
        } focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:scale-105`}
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : deleteConfirmState ? (
          <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        ) : (
          <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        )}
        {isLoading ? 'Deleting...' : deleteConfirmState ? 'Confirm Delete' : 'Delete Workout'}
      </button>
      
      <div className="flex w-full sm:w-auto space-x-3">
        <button
          type="button"
          onClick={() => {
            setDeleteConfirmState(false);
            onClose();
          }}
          className="inline-flex items-center justify-center py-2 px-4 border border-theme-border/50 text-theme-fg bg-theme-card hover:bg-theme-bg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-full transition-all duration-200 transform hover:scale-105 flex-1 sm:flex-initial"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={`inline-flex items-center justify-center py-2 px-5 border border-transparent shadow-sm text-sm font-medium rounded-full text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105 flex-1 sm:flex-initial ${
            isLoading ? 'opacity-75 cursor-not-allowed' : ''
          }`}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default WorkoutFormActions; 