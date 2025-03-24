import { prisma } from '@/lib/prisma';
import { stripe, PLANS, TRIAL_DAYS, hasTrialEnded, hasActiveSubscription } from './stripe-server';
import { SubscriptionStatus, SubscriptionPlan } from '@/types';
import { getTrialDaysRemaining, canAddWorkouts } from './stripe-server';

/**
 * Define subscription plans
 */
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    description: 'Monthly subscription plan',
    priceId: PLANS.MONTHLY,
    price: 499, // $4.99 per month
    interval: 'month',
  },
  {
    id: 'yearly',
    name: 'Yearly',
    description: 'Yearly subscription plan',
    priceId: PLANS.YEARLY,
    price: 4499, // $44.99 per year
    interval: 'year',
  },
];

/**
 * Create or retrieve a Stripe customer for a user
 */
export async function getOrCreateStripeCustomer(userId: string, email?: string | null): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (user?.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  // Create a new customer in Stripe
  const customer = await stripe.customers.create({
    email: email || undefined,
    metadata: {
      userId,
    },
  });

  // Update the user with the Stripe customer ID
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

/**
 * Create a checkout session for subscription
 */
export async function createCheckoutSession({
  userId,
  priceId,
  returnUrl,
}: {
  userId: string;
  priceId: string;
  returnUrl: string;
}) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Get or create the Stripe customer
  const customerId = await getOrCreateStripeCustomer(userId, user.email);

  // Create a checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${returnUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${returnUrl}?canceled=true`,
    metadata: {
      userId,
    },
  });

  return session;
}

/**
 * Create a portal session for managing subscription
 */
export async function createPortalSession({
  userId,
  returnUrl,
}: {
  userId: string;
  returnUrl: string;
}) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user?.stripeCustomerId) {
    throw new Error('User has no Stripe customer ID');
  }

  // Create a portal session
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: returnUrl,
  });

  return session;
}

/**
 * Set up a trial period for a new user
 */
export async function setupTrialPeriod(userId: string) {
  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + TRIAL_DAYS);

  await prisma.user.update({
    where: { id: userId },
    data: { trialEndsAt: trialEndDate },
  });

  return trialEndDate;
}

/**
 * Get a user's subscription status
 */
export async function getUserSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      stripeSubscriptionId: true,
      stripePriceId: true,
      stripeCurrentPeriodEnd: true,
      trialEndsAt: true,
      cancelAtPeriodEnd: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Find the current plan
  const currentPlan = user.stripePriceId
    ? SUBSCRIPTION_PLANS.find(plan => plan.priceId === user.stripePriceId)?.name || null
    : null;

  const isInTrial = !hasTrialEnded(user.trialEndsAt);
  const isSubscribed = hasActiveSubscription(user.stripeCurrentPeriodEnd);
  const trialDaysRemaining = getTrialDaysRemaining(user.trialEndsAt);
  const canAdd = canAddWorkouts(user.trialEndsAt, user.stripeCurrentPeriodEnd);

  return {
    isSubscribed,
    isInTrial,
    trialDaysRemaining,
    plan: currentPlan,
    periodEnd: user.stripeCurrentPeriodEnd,
    canAddWorkouts: canAdd,
    stripeSubscriptionId: user.stripeSubscriptionId,
    cancelAtPeriodEnd: user.cancelAtPeriodEnd || false,
  };
} 