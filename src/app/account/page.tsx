'use client';

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import axios from 'axios';

export default function AccountSettings() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Redirect if not authenticated
  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/account');
    }
  }, [status, router]);
  
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
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Account Settings</h1>
        
        {/* Profile Information */}
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Profile Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Personal details associated with your account.</p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center space-x-4">
              {session.user?.image ? (
                <img
                  className="h-16 w-16 rounded-full"
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                  <span className="text-indigo-800 dark:text-indigo-200 font-medium text-xl">
                    {session.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">{session.user?.name || 'User'}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{session.user?.email}</p>
              </div>
            </div>
            
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
              <dl className="divide-y divide-gray-200 dark:divide-gray-700">
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Full name</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{session.user?.name || 'Not provided'}</dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email address</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{session.user?.email}</dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Account created</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                    {/* Display account creation date if available */}
                    {(session as any).user?.createdAt 
                      ? new Date((session as any).user.createdAt).toLocaleDateString() 
                      : 'Not available'}
                  </dd>
                </div>
              </dl>
            </div>
            
            <div className="mt-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your profile information is managed by your authentication provider.
              </p>
            </div>
          </div>
        </div>
        
        {/* Data & Privacy */}
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Data & Privacy</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Manage your data and privacy settings.</p>
          </div>
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
        
        {/* App Preferences */}
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">App Preferences</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Customize your app experience.</p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white">Theme</h4>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  You can toggle between light and dark mode using the theme toggle in the navigation bar.
                </p>
              </div>
              
              {/* Add more preferences here as needed */}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 