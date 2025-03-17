'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import SubscriptionStatus from '@/components/SubscriptionStatus';
import axios from 'axios';
import TrialSetup from '@/components/TrialSetup';
import { SubscriptionStatus as SubscriptionStatusType } from '@/types';
import { useUnitPreferences } from '@/contexts/UnitPreferencesContext';

// Component to handle search params
function AccountContent() {
  const searchParams = useSearchParams();
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  
  // Check for success or canceled parameters from Stripe redirect
  const successParam = searchParams.get('success');
  const canceledParam = searchParams.get('canceled');
  
  // State to preserve parameter values after URL is cleared
  const [success, setSuccess] = useState(false);
  const [canceled, setCanceled] = useState(false);
  
  // State for account deletion
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<React.ReactNode>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatusType | null>(null);
  const [subscribedToEmails, setSubscribedToEmails] = useState(true);
  const [emailPrefLoading, setEmailPrefLoading] = useState(false);
  
  // Unit preferences
  const { preferences, updatePreferences, isLoading: unitPrefsLoading } = useUnitPreferences();
  const [unitPrefsUpdating, setUnitPrefsUpdating] = useState(false);
  
  // Store URL parameters in state and clear URL
  useEffect(() => {
    if (successParam) {
      setSuccess(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (canceledParam) {
      setCanceled(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [successParam, canceledParam]);
  
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/account');
    }
  }, [authStatus, router]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchSubscriptionStatus();
      fetchEmailPreferences();
    }
  }, [session]);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await axios.get('/api/subscription');
      setSubscriptionStatus(response.data.status);
    } catch (err) {
      console.error('Failed to load subscription status', err);
    }
  };

  const fetchEmailPreferences = async () => {
    try {
      const response = await axios.get('/api/user/email-preferences');
      setSubscribedToEmails(response.data.subscribedToEmails);
    } catch (error) {
      console.error('Failed to fetch email preferences:', error);
    }
  };
  
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
      if (error.response?.data?.code === 'ACTIVE_SUBSCRIPTION') {
        setDeleteError(
          <div>
            <p className="mb-2">{error.response.data.message}</p>
            <button
              type="button"
              onClick={handleManageSubscription}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Manage Subscription
            </button>
          </div>
        );
      } else if (error.response?.data?.code === 'ACTIVE_SUBSCRIPTION_PERIOD') {
        setDeleteError(
          <div>
            <p className="mb-2">{error.response.data.message}</p>
            <p className="text-xs text-theme-fg opacity-70 mt-1">
              Your subscription benefits will continue until this date. You can return after this date to delete your account.
            </p>
          </div>
        );
      } else {
        setDeleteError(error.response?.data?.error || 'Failed to delete account. Please try again.');
      }
      setIsLoading(false);
    }
  };
  
  // Handle manage subscription
  const handleManageSubscription = async () => {
    try {
      const response = await axios.post('/api/stripe/portal');
      
      // Redirect to Stripe Portal
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      console.error('Failed to create portal session', err);
    }
  };
  
  const handleEmailPreferenceChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setEmailPrefLoading(true);
    
    try {
      await axios.post('/api/user/email-preferences', {
        subscribedToEmails: newValue
      });
      setSubscribedToEmails(newValue);
      setSuccessMessage('Email preferences updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Failed to update email preferences:', error);
      setDeleteError('Failed to update email preferences. Please try again.');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setDeleteError(null);
      }, 3000);
    } finally {
      setEmailPrefLoading(false);
    }
  };
  
  const handleUnitPreferenceChange = async (key: 'weightUnit' | 'distanceUnit', value: any) => {
    try {
      setUnitPrefsUpdating(true);
      await updatePreferences({ [key]: value });
      setSuccessMessage('Unit preferences updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Failed to update unit preferences:', error);
      setDeleteError('Failed to update unit preferences. Please try again.');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setDeleteError(null);
      }, 3000);
    } finally {
      setUnitPrefsUpdating(false);
    }
  };
  
  if (authStatus === 'loading') {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (!session) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-theme-fg opacity-70">Redirecting to sign in...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-theme-fg">Account</h1>
        <p className="mt-1 text-sm text-theme-fg opacity-70">
          Manage your account and subscription
        </p>
      </div>
      
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Subscription successful
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  Thank you for subscribing to GymMentor! Your subscription is now active.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {canceled && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Subscription canceled
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  You canceled the subscription process. If you have any questions or need help, please contact us at us at support@gymmentorai.com!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg animate-fadeIn">
          <p>{successMessage}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-8">
        <div>
          <h2 className="text-xl font-semibold text-theme-fg mb-4">User Information</h2>
          <div className="bg-theme-card shadow sm:rounded-lg border border-theme-border">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {session?.user?.image ? (
                    <img className="h-12 w-12 rounded-full" src={session.user.image} alt={session.user.name || 'User'} />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-800 text-lg font-medium">
                        {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || '?'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-theme-fg">
                    {session?.user?.name || 'User'}
                  </h3>
                  <p className="text-sm text-theme-fg opacity-70">
                    {session?.user?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-theme-fg mb-4">Subscription</h2>
          <SubscriptionStatus />
        </div>
        
        {/* Unit Preferences Section */}
        <div>
          <h2 className="text-xl font-semibold text-theme-fg mb-4">Unit Preferences</h2>
          <div className="bg-theme-card shadow sm:rounded-lg border border-theme-border">
            <div className="px-4 py-5 sm:p-6">
              {unitPrefsLoading ? (
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-6 py-1">
                    <div className="h-4 bg-theme-accent rounded w-3/4"></div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="h-4 bg-theme-accent rounded col-span-2"></div>
                        <div className="h-4 bg-theme-accent rounded col-span-1"></div>
                      </div>
                      <div className="h-4 bg-theme-accent rounded"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-md font-medium text-theme-fg">Weight Units</h3>
                    <p className="mt-1 text-sm text-theme-fg opacity-70">
                      Choose your preferred unit for displaying weight measurements.
                    </p>
                    <div className="mt-4">
                      <div className="flex items-center space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio text-indigo-600"
                            value="lb"
                            checked={preferences.weightUnit === 'lb'}
                            onChange={() => handleUnitPreferenceChange('weightUnit', 'lb')}
                            disabled={unitPrefsUpdating}
                          />
                          <span className="ml-2">Pounds (lb)</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio text-indigo-600"
                            value="kg"
                            checked={preferences.weightUnit === 'kg'}
                            onChange={() => handleUnitPreferenceChange('weightUnit', 'kg')}
                            disabled={unitPrefsUpdating}
                          />
                          <span className="ml-2">Kilograms (kg)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-md font-medium text-theme-fg">Distance Units</h3>
                    <p className="mt-1 text-sm text-theme-fg opacity-70">
                      Choose your preferred unit for displaying distance measurements.
                    </p>
                    <div className="mt-4">
                      <div className="flex items-center space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio text-indigo-600"
                            value="mi"
                            checked={preferences.distanceUnit === 'mi'}
                            onChange={() => handleUnitPreferenceChange('distanceUnit', 'mi')}
                            disabled={unitPrefsUpdating}
                          />
                          <span className="ml-2">Miles (mi)</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio text-indigo-600"
                            value="km"
                            checked={preferences.distanceUnit === 'km'}
                            onChange={() => handleUnitPreferenceChange('distanceUnit', 'km')}
                            disabled={unitPrefsUpdating}
                          />
                          <span className="ml-2">Kilometers (km)</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio text-indigo-600"
                            value="m"
                            checked={preferences.distanceUnit === 'm'}
                            onChange={() => handleUnitPreferenceChange('distanceUnit', 'm')}
                            disabled={unitPrefsUpdating}
                          />
                          <span className="ml-2">Meters (m)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {unitPrefsUpdating && (
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-theme-fg mb-4">Data & Privacy</h2>
          <div className="bg-theme-card shadow sm:rounded-lg border border-theme-border">
            <div className="px-4 py-5 sm:p-6">
              <div>
                <h4 className="text-md font-medium text-theme-fg">Export Your Data</h4>
                <p className="mt-1 text-sm text-theme-fg opacity-70">
                  Download a copy of all your workout data in JSON format.
                </p>
              </div>
              <div className="mt-5">
                <a
                  href="/api/user/export"
                  download
                  className="inline-flex items-center px-4 py-2 border border-theme-border shadow-sm text-sm font-medium rounded-md text-theme-fg bg-theme-card hover:bg-theme-bg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Export Data
                </a>
              </div>
              
              <div className="pt-6">
                <h4 className="text-md font-medium text-red-600">Delete Account</h4>
                <p className="mt-1 text-sm text-theme-fg opacity-70">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <div className="mt-3">
                  {!showDeleteConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Delete Account
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-red-600">
                        Are you sure? This will permanently delete all your workout data and cannot be undone.
                        {subscriptionStatus?.isSubscribed && !subscriptionStatus.cancelAtPeriodEnd && (
                          <span className="block mt-1">
                            Note: You must cancel your active subscription before deleting your account.
                          </span>
                        )}
                        {subscriptionStatus?.isSubscribed && subscriptionStatus.cancelAtPeriodEnd && subscriptionStatus.periodEnd && (
                          <span className="block mt-1">
                            Note: You must wait until your subscription expires on {new Date(subscriptionStatus.periodEnd).toLocaleDateString()} before deleting your account.
                          </span>
                        )}
                      </p>
                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={handleDeleteAccount}
                          disabled={isLoading}
                          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                            isLoading ? 'opacity-75 cursor-not-allowed' : ''
                          }`}
                        >
                          {isLoading ? 'Deleting...' : 'Yes, Delete My Account'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(false)}
                          disabled={isLoading}
                          className="inline-flex items-center px-4 py-2 border border-theme-border shadow-sm text-sm font-medium rounded-md text-theme-fg bg-theme-card hover:bg-theme-bg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Cancel
                        </button>
                      </div>
                      {deleteError && (
                        <div className="text-sm text-red-600">{deleteError}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Email Preferences Section */}
      <div className="bg-theme-card shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Email Preferences</h2>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-theme-fg">Promotional emails</p>
            <p className="text-sm text-theme-fg-muted">
              Receive updates about new features and promotions
            </p>
          </div>
          <div className="flex items-center">
            {emailPrefLoading ? (
              <div className="animate-pulse h-5 w-10 bg-theme-hover rounded"></div>
            ) : (
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={subscribedToEmails}
                  onChange={handleEmailPreferenceChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading fallback
function AccountLoading() {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Layout>
      <TrialSetup />
      <Suspense fallback={<AccountLoading />}>
        <AccountContent />
      </Suspense>
    </Layout>
  );
} 