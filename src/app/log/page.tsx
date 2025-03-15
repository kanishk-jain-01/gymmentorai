'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import WorkoutInput from '@/components/WorkoutInput';
import WorkoutList from '@/components/WorkoutList';
import axios from 'axios';
import { Workout } from '@/types';
import Link from 'next/link';
import TrialSetup from '@/components/TrialSetup';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Redirect to sign-in if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/log');
    }
    
    // Fetch workouts when authenticated
    if (status === 'authenticated') {
      fetchWorkouts();
    }
  }, [status, router, session]);
  
  const fetchWorkouts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/workout');
      setWorkouts(response.data.workouts || []);
    } catch (error) {
      setWorkouts([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (status === 'loading') {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="ml-3 text-theme-fg opacity-80">Loading session...</p>
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
      <TrialSetup />
      
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Workout Log</h1>
          <p className="mt-1 text-sm">
            Log and view your workouts
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Log a Workout</h2>
            <WorkoutInput onWorkoutAdded={fetchWorkouts} />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Workouts</h2>
              <Link href="/workouts" className="text-sm hover:text-indigo-800">
                View All →
              </Link>
            </div>
            <WorkoutList 
              workouts={workouts} 
              isLoading={isLoading} 
              onWorkoutUpdated={fetchWorkouts}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
} 