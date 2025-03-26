import React from 'react';
import { SubscriptionStatus } from '@/types';
import { formatDate } from '@/lib/utils';

interface DataPrivacySectionProps {
  subscriptionStatus: SubscriptionStatus | null;
  showDeleteConfirm: boolean;
  isLoading: boolean;
  deleteError: React.ReactNode;
  onDeleteAccount: () => void;
  onManageSubscription: () => void;
  onToggleDeleteConfirm: (show: boolean) => void;
}

const DataPrivacySection = ({
  subscriptionStatus,
  showDeleteConfirm,
  isLoading,
  deleteError,
  onDeleteAccount,
  onManageSubscription,
  onToggleDeleteConfirm
}: DataPrivacySectionProps) => {
  return (
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
                  onClick={() => onToggleDeleteConfirm(true)}
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
                        Note: You must wait until your subscription expires on {formatDate(subscriptionStatus.periodEnd)} before deleting your account.
                      </span>
                    )}
                  </p>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={onDeleteAccount}
                      disabled={isLoading}
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                        isLoading ? 'opacity-75 cursor-not-allowed' : ''
                      }`}
                    >
                      {isLoading ? 'Deleting...' : 'Yes, Delete My Account'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleDeleteConfirm(false)}
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
  );
};

export default DataPrivacySection; 