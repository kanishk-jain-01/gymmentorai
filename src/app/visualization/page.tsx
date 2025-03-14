'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import WorkoutVisualization from '@/components/WorkoutVisualization';

export default function Visualization() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/visualization');
    }
  }, [status, router]);
  
  if (status === 'loading') {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </Layout>
    );
  }
  
  if (!session) {
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
          <h1 className="text-2xl font-bold">Workout Visualization</h1>
          <p className="mt-1 text-sm">
            Track your progress and get insights into your fitness journey
          </p>
        </div>
        
        <WorkoutVisualization />
      </div>
    </Layout>
  );
} 