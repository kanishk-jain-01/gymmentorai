'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-4xl font-extrabold text-indigo-600">GymMentor</h1>
        <p className="text-xl text-gray-600">
          AI-powered workout tracking and analysis
        </p>
        
        <div className="mt-8 space-y-4">
          <Link
            href="/dashboard"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Get Started
          </Link>
        </div>
        
        {/* Debug section */}
        <div className="mt-8 p-4 border rounded bg-gray-100 text-left">
          <h3 className="font-bold">Session Debug:</h3>
          <p>Status: {status}</p>
          <p>User ID: {session?.user?.id || 'Not available'}</p>
          <p>User Email: {session?.user?.email || 'Not available'}</p>
          <pre className="mt-2 text-xs overflow-auto max-h-40">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
