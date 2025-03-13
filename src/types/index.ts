/**
 * Shared type definitions for the application
 */

/**
 * Exercise type representing a single exercise in a workout
 */
export interface Exercise {
  id: string;
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number;
  distance?: number;
  notes?: string;
  createdAt?: string;
}

/**
 * Workout type representing a complete workout session
 */
export interface Workout {
  id: string;
  date: string;
  name?: string;
  notes?: string;
  duration?: number;
  rawInput?: string;
  userId?: string;
  exercises: Exercise[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Parsed workout from LLM service
 */
export interface ParsedWorkout {
  name?: string;
  date: Date;
  duration?: number;
  notes?: string;
  exercises: {
    name: string;
    sets?: number;
    reps?: number;
    weight?: number;
    duration?: number;
    distance?: number;
    notes?: string;
  }[];
}

/**
 * Subscription plan type
 */
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceId: string;
  price: number;
  interval: 'month' | 'year';
}

/**
 * User subscription status
 */
export interface SubscriptionStatus {
  isSubscribed: boolean;
  isInTrial: boolean;
  trialDaysRemaining: number;
  plan: string | null;
  periodEnd: Date | null;
  canAddWorkouts: boolean;
  stripeSubscriptionId?: string | null;
  cancelAtPeriodEnd: boolean;
}

/**
 * Extended user type with subscription information
 */
export interface UserWithSubscription {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
  stripeCurrentPeriodEnd?: Date | null;
  trialEndsAt?: Date | null;
} 