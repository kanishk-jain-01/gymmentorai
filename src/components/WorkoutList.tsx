import React from 'react';
import { format } from 'date-fns';

interface Exercise {
  id: string;
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number;
  distance?: number;
  notes?: string;
}

interface Workout {
  id: string;
  date: string;
  name?: string;
  notes?: string;
  duration?: number;
  exercises: Exercise[];
}

interface WorkoutListProps {
  workouts: Workout[];
  isLoading: boolean;
}

export default function WorkoutList({ workouts, isLoading }: WorkoutListProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-6 py-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded col-span-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded col-span-1"></div>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (workouts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md p-6 text-center border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">No workouts found. Start logging your workouts!</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md border border-gray-200 dark:border-gray-700">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {workouts.map((workout) => (
          <li key={workout.id}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-indigo-600 dark:text-indigo-400 truncate">
                  {workout.name || 'Workout'}
                </h3>
                <div className="ml-2 flex-shrink-0 flex">
                  <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    {format(new Date(workout.date), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              
              {workout.duration && (
                <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  {workout.duration} minutes
                </div>
              )}
              
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Exercises:</h4>
                <ul className="mt-2 divide-y divide-gray-100 dark:divide-gray-700">
                  {workout.exercises.map((exercise) => (
                    <li key={exercise.id} className="py-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{exercise.name}</p>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-4 text-xs text-gray-500 dark:text-gray-400">
                        {exercise.sets && exercise.reps && (
                          <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">{exercise.sets} sets × {exercise.reps} reps</span>
                        )}
                        {exercise.weight && (
                          <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">{exercise.weight} {exercise.weight === 1 ? 'lb' : 'lbs'}</span>
                        )}
                        {exercise.duration && (
                          <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">{exercise.duration} seconds</span>
                        )}
                        {exercise.distance && (
                          <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">{exercise.distance} {exercise.distance === 1 ? 'mile' : 'miles'}</span>
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
                <div className="mt-3 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded-md">
                  <p className="italic">{workout.notes}</p>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 