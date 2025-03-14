'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import TimeCard from '@/components/TimeCard';
import axios from 'axios';
import { Workout } from '@/types';
import { organizeWorkoutsByMonth } from '@/lib/utils';

interface YearPageProps {
  params: Promise<{
    year: string;
  }>;
}

export default function YearPage({ params }: YearPageProps) {
  // Unwrap params using React.use()
  const { year } = React.use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [workoutsByMonth, setWorkoutsByMonth] = useState<Record<string, Workout[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Redirect to sign-in if not authenticated
    if (status === 'unauthenticated') {
      router.push(`/auth/signin?callbackUrl=/workouts/${year}`);
    }
    
    // Fetch workouts when authenticated
    if (status === 'authenticated') {
      fetchWorkouts();
    }
  }, [status, router, year, session]);
  
  const fetchWorkouts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/workout/all');
      const allWorkouts = response.data.workouts || [];
      setWorkouts(allWorkouts);
      
      // Organize workouts by month for this year
      const byMonth = organizeWorkoutsByMonth(allWorkouts, year);
      setWorkoutsByMonth(byMonth);
    } catch (error) {
      console.error('Error fetching workouts:', error);
      setWorkouts([]);
      setWorkoutsByMonth({});
    } finally {
      setIsLoading(false);
    }
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
  
  // Get months in order (January to December)
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const months = monthNames.filter(month => workoutsByMonth[month] && workoutsByMonth[month].length > 0);
  
  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center">
              <Link href="/workouts" className="hover:text-indigo-800 mr-2">
                ← Back to Years
              </Link>
            </div>
            <h1 className="text-2xl font-bold mt-4">Workouts in {year}</h1>
            <p className="mt-1 text-sm">
              Browse your workout history by month
            </p>
          </div>
        </div>
        
        {months.length === 0 ? (
          <div className="shadow overflow-hidden sm:rounded-md p-6 text-center border border-theme-border">
            <p>No workouts found for {year}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {months.map(month => (
              <TimeCard
                key={month}
                title={month}
                count={workoutsByMonth[month].length}
                href={`/workouts/${year}/${monthNames.indexOf(month) + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
} 