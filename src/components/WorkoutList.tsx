import React, { useState } from 'react';
import WorkoutEditor from './WorkoutEditor';
import { Exercise, Workout } from '@/types';

interface WorkoutListProps {
  workouts: Workout[];
  isLoading: boolean;
  onWorkoutUpdated: () => void;
}

export default function WorkoutList({ workouts, isLoading, onWorkoutUpdated }: WorkoutListProps) {
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);

  if (isLoading) {
    return (
      <div className="bg-theme-card shadow overflow-hidden sm:rounded-md p-6 border border-theme-border">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-6 py-1">
            <div className="h-4 bg-theme-accent rounded w-3/4"></div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-4 bg-theme-accent rounded col-span-2"></div>
                <div className="h-4 bg-theme-accent rounded col-span-1"></div>
              </div>
              <div className="h-4 bg-theme-accent rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (workouts.length === 0) {
    return (
      <div className="bg-theme-card shadow overflow-hidden sm:rounded-md p-6 text-center border border-theme-border">
        <p className="text-body">No workouts found. Start logging your workouts!</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-theme-card shadow overflow-hidden sm:rounded-md border border-theme-border">
        <ul className="divide-y divide-theme-border">
          {workouts.map((workout) => (
            <li key={workout.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-indigo-600 truncate">
                    {workout.name || 'Workout'}
                  </h3>
                  <div className="ml-2 flex-shrink-0 flex items-center space-x-2">
                    <button
                      onClick={() => setEditingWorkout(workout)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Edit
                    </button>
                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-theme-accent text-theme-fg">
                      {new Date(workout.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {workout.duration && (
                  <div className="mt-2 flex items-center text-sm text-body">
                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-body opacity-70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    {workout.duration} minutes
                  </div>
                )}
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-body">Exercises:</h4>
                  <ul className="mt-2 divide-y divide-theme-border">
                    {workout.exercises.map((exercise) => (
                      <li key={exercise.id} className="py-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-theme-fg">{exercise.name}</p>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-4 text-xs text-body opacity-80">
                          {/* Display sets and reps in different scenarios */}
                          {exercise.sets && exercise.reps ? (
                            <span className="bg-theme-accent px-2 py-1 rounded-md">{exercise.sets} sets × {exercise.reps} reps</span>
                          ) : exercise.sets ? (
                            <span className="bg-theme-accent px-2 py-1 rounded-md">{exercise.sets} {exercise.sets === 1 ? 'set' : 'sets'}</span>
                          ) : exercise.reps ? (
                            <span className="bg-theme-accent px-2 py-1 rounded-md">{exercise.reps} reps</span>
                          ) : null}
                          
                          {exercise.weight && (
                            <span className="bg-theme-accent px-2 py-1 rounded-md">{exercise.weight} {exercise.weight === 1 ? 'lb' : 'lbs'}</span>
                          )}
                          {exercise.duration && (
                            <span className="bg-theme-accent px-2 py-1 rounded-md">{exercise.duration} seconds</span>
                          )}
                          {exercise.distance && (
                            <span className="bg-theme-accent px-2 py-1 rounded-md">{exercise.distance} {exercise.distance === 1 ? 'mile' : 'miles'}</span>
                          )}
                          {exercise.notes && (
                            <span className="italic">{exercise.notes}</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {workout.notes && (
                  <div className="mt-3 text-sm text-body opacity-80 bg-theme-accent p-2 rounded-md">
                    <p className="italic">{workout.notes}</p>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Keep the WorkoutEditor component as is */}
      {editingWorkout && (
        <WorkoutEditor
          workout={editingWorkout}
          onClose={() => setEditingWorkout(null)}
          onWorkoutUpdated={onWorkoutUpdated}
        />
      )}
    </>
  );
} 