'use client';

import React, { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import SubscriptionStatus from '@/components/SubscriptionStatus';
import axios from 'axios';

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Check for success or canceled parameters from Stripe redirect
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');
  
  // State for account deletion
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/account');
    }
  }, [status, router]);
  
  // Handle account deletion
  const handleDeleteAccount = async () => {
    try {
      setIsLoading(true);
      setDeleteError(null);
      
      // Call API to delete account
      await axios.delete('/api/user/account');
      
      // Sign out the user
      await signOut({ callbackUrl: '/' });
    } catch (error: any) {
      setDeleteError(error.response?.data?.error || 'Failed to delete account. Please try again.');
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
  
  if (!session) {
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your account and subscription
          </p>
        </div>
        
        {success && (
          <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                  Subscription successful
                </h3>
                <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                  <p>
                    Thank you for subscribing to GymMentor! Your subscription is now active.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {canceled && (
          <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Subscription canceled
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>
                    You canceled the subscription process. If you have any questions or need help, please contact us.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">User Information</h2>
            <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center space-x-4">
                  {session.user?.image && (
                    <img 
                      src={session.user.image} 
                      alt={session.user?.name || 'User'} 
                      className="h-12 w-12 rounded-full"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {session.user?.name || 'User'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {session.user?.email || ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Subscription</h2>
            <SubscriptionStatus />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Data & Privacy</h2>
            <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white">Export Your Data</h4>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Download a copy of your workout data in JSON format.
                    </p>
                    <div className="mt-3">
                      <a
                        href="/api/user/export"
                        download
                        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-900"
                      >
                        Export Data
                      </a>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-md font-medium text-red-600 dark:text-red-400">Delete Account</h4>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <div className="mt-3">
                      {!showDeleteConfirm ? (
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(true)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-red-400 dark:focus:ring-offset-gray-900"
                        >
                          Delete Account
                        </button>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-red-600 dark:text-red-400">
                            Are you sure? This will permanently delete all your workout data and cannot be undone.
                          </p>
                          <div className="flex space-x-3">
                            <button
                              type="button"
                              onClick={handleDeleteAccount}
                              disabled={isLoading}
                              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-red-400 dark:focus:ring-offset-gray-900 ${
                                isLoading ? 'opacity-75 cursor-not-allowed' : ''
                              }`}
                            >
                              {isLoading ? 'Deleting...' : 'Yes, Delete My Account'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowDeleteConfirm(false)}
                              disabled={isLoading}
                              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-900"
                            >
                              Cancel
                            </button>
                          </div>
                          {deleteError && (
                            <p className="text-sm text-red-600 dark:text-red-400">{deleteError}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 