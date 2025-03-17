'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  
  return (
    <Layout>
      <div className="max-w-md mx-auto py-12">
        <div className="bg-theme-card shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Email Preferences</h1>
          
          {status === 'success' ? (
            <div>
              <p className="mb-4">
                You have been successfully unsubscribed from promotional emails.
              </p>
              <p className="mb-6">
                If you change your mind, you can update your email preferences in your account settings.
              </p>
            </div>
          ) : (
            <div>
              <p className="mb-4 text-red-500">
                There was an error processing your unsubscribe request.
              </p>
              <p className="mb-6">
                Please try again or update your email preferences in your account settings.
              </p>
            </div>
          )}
          
          <div className="mt-6">
            <Link 
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
} 