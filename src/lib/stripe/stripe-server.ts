import Stripe from 'stripe';

// Initialize Stripe with the secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16', // Use the latest API version
  typescript: true,
});

// Subscription plan price IDs
export const PLANS = {
  MONTHLY: process.env.STRIPE_MONTHLY_PRICE_ID || '',
  YEARLY: process.env.STRIPE_YEARLY_PRICE_ID || '',
};

// Trial period in days
export const TRIAL_DAYS = parseInt(process.env.TRIAL_DAYS || '7', 10);

// Check if a user's trial period has ended
export function hasTrialEnded(trialEndsAt: Date | null | undefined): boolean {
  // If there's no trial end date, consider the trial as ended
  if (!trialEndsAt) return true;
  return new Date() > new Date(trialEndsAt);
}

// Check if a user has an active subscription
export function hasActiveSubscription(
  stripeCurrentPeriodEnd: Date | null | undefined
): boolean {
  if (!stripeCurrentPeriodEnd) return false;
  
  // Add a buffer time (1 hour) to account for webhook processing delays
  const bufferTime = 60 * 60 * 1000; // 1 hour in milliseconds
  const currentTime = new Date().getTime();
  const periodEndTime = new Date(stripeCurrentPeriodEnd).getTime();
  
  return currentTime < periodEndTime + bufferTime;
}

// Check if a user can add new workouts
export function canAddWorkouts(
  trialEndsAt: Date | null | undefined,
  stripeCurrentPeriodEnd: Date | null | undefined
): boolean {
  // User can add workouts if they have an active subscription or are in trial period
  const isInTrial = !hasTrialEnded(trialEndsAt);
  const hasSubscription = hasActiveSubscription(stripeCurrentPeriodEnd);
  
  return isInTrial || hasSubscription;
}

// Format a price from cents to dollars/currency
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(price / 100);
}

// Calculate days remaining in trial
export function getTrialDaysRemaining(trialEndsAt: Date | null | undefined): number {
  if (!trialEndsAt) return 0;
  
  const now = new Date();
  const trial = new Date(trialEndsAt);
  
  if (now > trial) return 0;
  
  const diffTime = Math.abs(trial.getTime() - now.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
} 