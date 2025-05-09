import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { SubscriptionStatus as SubscriptionStatusType, SubscriptionPlan, SubscriptionStatusProps } from '@/types';
import { formatDate } from '@/lib/utils';

const SubscriptionStatus = ({ onSubscriptionChange }: SubscriptionStatusProps) => {
  const [status, setStatus] = useState<SubscriptionStatusType | null>(null);
  const [plans, setPlans] = useState<(SubscriptionPlan & { formattedPrice: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  // Fetch subscription status
  const fetchSubscriptionStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get('/api/subscription');
      setStatus(response.data.status);
      setPlans(response.data.plans);
      
      // Call the callback with the subscription status
      if (onSubscriptionChange && response.data.status) {
        onSubscriptionChange(response.data.status);
      }
    } catch (err) {
      setError('Failed to load subscription status');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  // Handle checkout
  const handleCheckout = async (priceId: string) => {
    try {
      setIsCheckoutLoading(true);
      setError(null);
      const response = await axios.post('/api/stripe/checkout', { priceId });
      
      // Redirect to Stripe Checkout
      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        setError('Failed to create checkout session');
      }
    } catch (err) {
      setError('Failed to create checkout session');
      console.error(err);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  // Handle portal
  const handlePortal = async () => {
    try {
      setIsPortalLoading(true);
      setError(null);
      const response = await axios.post('/api/stripe/portal');
      
      // Redirect to Stripe Portal
      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        setError('Failed to create portal session');
      }
    } catch (err) {
      setError('Failed to create portal session');
      console.error(err);
    } finally {
      setIsPortalLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-theme-card shadow sm:rounded-lg border border-theme-border p-6">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-theme-bg rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-theme-bg rounded"></div>
              <div className="h-4 bg-theme-bg rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-theme-card shadow sm:rounded-lg border border-theme-border p-6">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-theme-card shadow sm:rounded-lg border border-theme-border">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-theme-fg">
          Subscription Status
        </h3>
        
        {status && (
          <div className="mt-5">
            {status.isSubscribed ? (
              <div className="mb-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-theme-fg">
                      Active Subscription
                    </h4>
                    <p className="text-sm text-theme-fg opacity-70">
                      {status.plan} plan
                      {status.periodEnd && (status.cancelAtPeriodEnd
                        ? ` (ends on ${formatDate(status.periodEnd)})`
                        : ` (renews on ${formatDate(status.periodEnd)})`)}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handlePortal}
                    disabled={isPortalLoading}
                    className="inline-flex items-center px-4 py-2 border border-theme-border shadow-sm text-sm font-medium rounded-md text-theme-fg bg-theme-card hover:bg-theme-bg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {isPortalLoading ? 'Loading...' : 'Manage Subscription'}
                  </button>
                </div>
              </div>
            ) : status.isInTrial ? (
              <div className="mb-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-theme-fg">
                      Free Trial
                    </h4>
                    <p className="text-sm text-theme-fg opacity-70">
                      {status.trialDaysRemaining > 0 
                        ? `You have ${status.trialDaysRemaining} day${status.trialDaysRemaining === 1 ? '' : 's'} left in your trial.`
                        : 'Your trial has ended.'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-theme-fg">
                      No Active Subscription
                    </h4>
                    <p className="text-sm text-theme-fg opacity-70">
                      {status.isInTrial 
                        ? 'Your trial is active, but you can subscribe now to ensure uninterrupted service.'
                        : 'Your trial has ended. Subscribe to continue adding workouts.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {!status.isSubscribed && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-theme-fg mb-3">
                  Available Plans
                </h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {plans.map((plan) => (
                    <div key={plan.id} className="border border-theme-border rounded-lg p-4">
                      <h5 className="text-lg font-medium text-theme-fg">
                        {plan.name}
                      </h5>
                      <p className="mt-1 text-sm text-theme-fg opacity-70">
                        {plan.description}
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-theme-fg">
                        {plan.formattedPrice}
                        <span className="text-sm font-normal text-theme-fg opacity-70">
                          /{plan.interval}
                        </span>
                      </p>
                      <button
                        type="button"
                        onClick={() => handleCheckout(plan.priceId)}
                        disabled={isCheckoutLoading}
                        className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        {isCheckoutLoading ? 'Loading...' : `Subscribe ${plan.interval === 'month' ? 'Monthly' : 'Yearly'}`}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionStatus; 