import React, { useState } from 'react';
import WorkoutEditor from './WorkoutEditor/index';
import { Exercise, Workout, Set, WorkoutListProps } from '../types';
import { formatDuration, formatWorkoutDuration, formatWeight, formatDistance, formatDate, formatPace } from '@/lib/utils';
import { useUnitPreferences } from '@/contexts/UnitPreferencesContext';

const WorkoutList: React.FC<WorkoutListProps> = ({ workouts, isLoading, onWorkoutUpdated }) => {
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const { preferences } = useUnitPreferences();

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
        <p className="text-theme-fg">No workouts found. Start logging your workouts!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {workouts.map((workout) => (
          <div 
            key={workout.id} 
            className="bg-theme-card shadow sm:rounded-md border border-theme-border overflow-hidden hover:border-subtle transition-colors duration-200"
          >
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium truncate text-theme-fg">
                  {workout.name || 'Workout'}
                </h3>
                <div className="ml-2 flex-shrink-0 flex items-center space-x-2">
                  <button
                    onClick={() => setEditingWorkout(workout)}
                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded bg-gradient-primary text-white hover:bg-gradient-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                  >
                    Edit
                  </button>
                  <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-subtle border border-subtle text-primary">
                    {formatDate(workout.date)}
                  </p>
                </div>
              </div>
              
              {workout.duration && (
                <div className="mt-2 flex items-center text-sm text-theme-fg">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-primary opacity-70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  {formatWorkoutDuration(workout.duration)}
                </div>
              )}
              
              <div className="mt-4">
                <h4 className="text-sm font-medium text-primary">Exercises:</h4>
                <ul className="mt-2 divide-y divide-theme-border">
                  {workout.exercises.map((exercise) => (
                    <li key={exercise.id} className="py-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-theme-fg">{exercise.name}</p>
                      </div>
                      
                      {exercise.notes && (
                        <p className="mt-1 text-xs text-theme-fg opacity-80 italic">{exercise.notes}</p>
                      )}
                      
                      {/* Display sets */}
                      <div className="mt-2 overflow-x-auto">
                        <table className="min-w-full divide-y divide-theme-border/30 text-xs">
                          <thead>
                            <tr>
                              <th scope="col" className="px-2 py-1 text-left text-xs font-medium text-primary opacity-70 w-10">Set</th>
                              <th scope="col" className="px-2 py-1 text-left text-xs font-medium text-primary opacity-70">Reps</th>
                              <th scope="col" className="px-2 py-1 text-left text-xs font-medium text-primary opacity-70">Weight</th>
                              <th scope="col" className="px-2 py-1 text-left text-xs font-medium text-primary opacity-70">Duration (mm:ss)</th>
                              <th scope="col" className="px-2 py-1 text-left text-xs font-medium text-primary opacity-70">Distance</th>
                              <th scope="col" className="px-2 py-1 text-left text-xs font-medium text-primary opacity-70">Pace</th>
                              <th scope="col" className="px-2 py-1 text-left text-xs font-medium text-primary opacity-70">Notes</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-theme-border/20">
                            {exercise.sets.map((set, setIndex) => (
                              <tr key={set.id} className={setIndex % 2 === 0 ? 'bg-subtle' : 'bg-highlight'}>
                                <td className="px-2 py-1 whitespace-nowrap text-theme-fg font-medium">{setIndex + 1}</td>
                                <td className="px-2 py-1 whitespace-nowrap text-theme-fg">{set.reps || '-'}</td>
                                <td className="px-2 py-1 whitespace-nowrap text-theme-fg">
                                  {set.weight ? formatWeight(set.weight, preferences.weightUnit) : '-'}
                                </td>
                                <td className="px-2 py-1 whitespace-nowrap text-theme-fg">
                                  {set.duration ? formatDuration(set.duration) : '-'}
                                </td>
                                <td className="px-2 py-1 whitespace-nowrap text-theme-fg">
                                  {set.distance ? formatDistance(set.distance, preferences.distanceUnit) : '-'}
                                </td>
                                <td className="px-2 py-1 whitespace-nowrap text-theme-fg">
                                  {(set.duration && set.distance) ? 
                                    `${formatPace(set.duration, set.distance, preferences.distanceUnit === 'mi' ? 'mi' : 'km')}/${preferences.distanceUnit === 'mi' ? 'mi' : 'km'}` : '-'}
                                </td>
                                <td className="px-2 py-1 whitespace-nowrap text-theme-fg italic">
                                  {set.notes || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              {workout.notes && (
                <div className="mt-3 text-sm text-theme-fg bg-subtle border border-subtle p-2 rounded-md">
                  <p className="italic">{workout.notes}</p>
                </div>
              )}
            </div>
          </div>
        ))}
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

export default WorkoutList; 