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
    // Redirect to sign-in if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/dashboard');
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
          <p className="ml-3 text-gray-600">Loading session...</p>
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