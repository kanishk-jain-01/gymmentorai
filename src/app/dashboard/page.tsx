'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import WorkoutInput from '@/components/WorkoutInput';
import WorkoutList from '@/components/WorkoutList';
import axios from 'axios';

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

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    console.log('Dashboard - Session status:', status);
    console.log('Dashboard - Session data:', session);
    
    if (status === 'unauthenticated') {
      console.log('User is not authenticated, redirecting to sign-in');
      router.push('/auth/signin?callbackUrl=/dashboard');
    }
  }, [status, router, session]);
  
  useEffect(() => {
    if (session?.user?.id) {
      console.log('User is authenticated, fetching workouts');
      fetchWorkouts();
    }
  }, [session]);
  
  const fetchWorkouts = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching workouts...');
      const response = await axios.get('/api/workout');
      console.log('Workouts response:', response.data);
      setWorkouts(response.data.workouts || []);
    } catch (error) {
      console.error('Error fetching workouts:', error);
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
        </div>
      </Layout>
    );
  }
  
  if (status === 'unauthenticated') {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Redirecting to sign in...</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Log your workouts and track your progress
          </p>
          {/* Debug info */}
          {process.env.NODE_ENV !== 'production' && (
            <div className="mt-2 p-2 border rounded bg-gray-50 text-xs">
              <p>User: {session?.user?.name || 'Unknown'}</p>
              <p>User ID: {session?.user?.id || 'Not available'}</p>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Log a Workout</h2>
            <WorkoutInput onWorkoutAdded={fetchWorkouts} />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Workouts</h2>
            <WorkoutList workouts={workouts} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </Layout>
  );
} 