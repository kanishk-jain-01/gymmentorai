'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import WorkoutList from '@/components/WorkoutList';
import axios from 'axios';
import { Workout, MonthPageProps } from '@/types';

export default function MonthPage({ params }: MonthPageProps) {
  // Unwrap params using React.use()
  const { year, month } = React.use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Convert month number to name
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthIndex = parseInt(month) - 1;
  const monthName = monthNames[monthIndex] || 'Unknown';
  
  useEffect(() => {
    // Redirect to sign-in if not authenticated
    if (status === 'unauthenticated') {
      router.push(`/auth/signin?callbackUrl=/workouts/${year}/${month}`);
    }
    
    // Fetch workouts when authenticated
    if (status === 'authenticated') {
      fetchWorkouts();
    }
  }, [status, router, year, month, session]);
  
  const fetchWorkouts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/workout/all');
      const allWorkouts = response.data.workouts || [];
      
      // Filter workouts for this month and year
      const filteredWorkouts = allWorkouts.filter(workout => {
        const date = new Date(workout.date);
        return (
          date.getFullYear().toString() === year &&
          date.getMonth() === monthIndex
        );
      });
      
      setWorkouts(filteredWorkouts);
    } catch (error) {
      console.error('Error fetching workouts:', error);
      setWorkouts([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleWorkoutUpdated = () => {
    fetchWorkouts();
  };
  
  if (status === 'loading' || isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="ml-3">Loading workouts...</p>
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
  
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <div className="flex items-center">
            <Link href={`/workouts/${year}`} className="hover:text-indigo-800 mr-2">
              ← Back to {year}
            </Link>
          </div>
          <h1 className="text-2xl font-bold mt-4">{monthName} {year}</h1>
          <p className="mt-1 text-sm">
            All workouts from this month
          </p>
        </div>
        
        <WorkoutList 
          workouts={workouts} 
          isLoading={isLoading} 
          onWorkoutUpdated={handleWorkoutUpdated}
        />
      </div>
    </Layout>
  );
} 