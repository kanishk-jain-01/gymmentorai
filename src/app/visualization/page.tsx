'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import WorkoutVisualization from '@/components/WorkoutVisualization';

export default function Visualization() {
  // For development, create a mock session
  const mockSession = {
    user: {
      id: 'dev-user-id',
      name: 'Development User',
      email: 'dev@example.com',
      image: null
    }
  };
  
  // Use the real session in production, mock in development
  const { data: realSession, status: realStatus } = useSession();
  const session = process.env.NODE_ENV === 'production' ? realSession : mockSession;
  const status = process.env.NODE_ENV === 'production' ? realStatus : 'authenticated';
  
  const router = useRouter();
  
  React.useEffect(() => {
    // Only redirect in production
    if (process.env.NODE_ENV === 'production' && status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);
  
  if (status === 'loading' && process.env.NODE_ENV === 'production') {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workout Visualization</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your progress and get insights into your fitness journey
          </p>
        </div>
        
        <WorkoutVisualization />
      </div>
    </Layout>
  );
} 