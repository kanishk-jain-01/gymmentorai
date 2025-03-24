import React, { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { SubscriptionStatus as SubscriptionStatusType } from '@/types';
import { useUnitPreferences } from '@/contexts/UnitPreferencesContext';
import NotificationBanner from './NotificationBanner';
import UserInfoSection from './UserInfoSection';
import SubscriptionWrapper from './SubscriptionWrapper';
import UnitPreferencesSection from './UnitPreferencesSection';
import DataPrivacySection from './DataPrivacySection';
import AccountLoading from './AccountLoading';

const AccountContent: React.FC = () => {
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
    return <AccountLoading />;
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
      
      <NotificationBanner 
        success={success}
        canceled={canceled}
        successMessage={successMessage}
      />
      
      <div className="grid grid-cols-1 gap-8">
        <UserInfoSection session={session} />
        
        <SubscriptionWrapper onSubscriptionStatusChange={setSubscriptionStatus} />
        
        <UnitPreferencesSection 
          preferences={preferences}
          unitPrefsLoading={unitPrefsLoading}
          unitPrefsUpdating={unitPrefsUpdating}
          onUnitPreferenceChange={handleUnitPreferenceChange}
        />
        
        <DataPrivacySection 
          subscriptionStatus={subscriptionStatus}
          showDeleteConfirm={showDeleteConfirm}
          isLoading={isLoading}
          deleteError={deleteError}
          onDeleteAccount={handleDeleteAccount}
          onManageSubscription={handleManageSubscription}
          onToggleDeleteConfirm={setShowDeleteConfirm}
        />
      </div>
    </div>
  );
};

export default AccountContent; 