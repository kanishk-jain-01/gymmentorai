'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import TimeCard from '@/components/TimeCard';
import axios from 'axios';
import { Workout } from '@/types';
import { organizeWorkoutsByYear } from '@/lib/utils';

export default function WorkoutArchive() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [workoutsByYear, setWorkoutsByYear] = useState<Record<string, Workout[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Redirect to sign-in if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/workouts');
    }
    
    // Fetch workouts when authenticated
    if (status === 'authenticated') {
      fetchWorkouts();
    }
  }, [status, router, session]);
  
  const fetchWorkouts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/workout/all');
      const allWorkouts = response.data.workouts || [];
      setWorkouts(allWorkouts);
      
      // Organize workouts by year
      const byYear = organizeWorkoutsByYear(allWorkouts);
      setWorkoutsByYear(byYear);
    } catch (error) {
      console.error('Error fetching workouts:', error);
      setWorkouts([]);
      setWorkoutsByYear({});
    } finally {
      setIsLoading(false);
    }
  };
  
  if (status === 'loading' || isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="ml-3 text-theme-fg opacity-80">Loading workouts...</p>
        </div>
      </Layout>
    );
  }
  
  if (status === 'unauthenticated') {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p>Redirecting to sign in...</p>
        </div>
      </Layout>
    );
  }
  
  const years = Object.keys(workoutsByYear).sort((a, b) => parseInt(b) - parseInt(a));
  
  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Workout Archive</h1>
            <p className="mt-1 text-sm">
              Browse your workout history by year
            </p>
          </div>
        </div>
        
        {years.length === 0 ? (
          <div className="shadow overflow-hidden sm:rounded-md p-6 text-center border border-theme-border">
            <p className="text-theme-fg opacity-70">No workouts found. Start logging your workouts!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {years.map(year => (
              <TimeCard
                key={year}
                title={year}
                count={workoutsByYear[year].length}
                href={`/workouts/${year}`}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
} 