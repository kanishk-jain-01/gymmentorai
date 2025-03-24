import { Session } from 'next-auth';
import { ChartData, ChartDataset, ScatterDataPoint } from 'chart.js';

/*******************************************************************************
 * WORKOUT TYPES
 ******************************************************************************/

/**
 * Set type representing a single set of an exercise
 */
export interface Set {
  id: string;
  reps?: number;
  weight?: number;
  duration?: number;
  distance?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Exercise type representing a single exercise in a workout
 */
export interface Exercise {
  id: string;
  name: string;
  notes?: string;
  sets: Set[];
  createdAt?: string;
  updatedAt?: string;
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
    sets: {
      reps?: number;
      weight?: number;
      duration?: number;
      distance?: number;
      notes?: string;
    }[];
    notes?: string;
  }[];
}

/*******************************************************************************
 * SUBSCRIPTION & USER TYPES
 ******************************************************************************/

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

export interface SubscriptionStatusProps {
  onSubscriptionChange?: (status: SubscriptionStatus) => void;
}

/**
 * Extended auth session with user data
 */
export interface ExtendedSession extends Session {
  user?: UserWithSubscription;
}

/*******************************************************************************
 * CHART & VISUALIZATION TYPES
 ******************************************************************************/

/**
 * Chart configuration
 */
export interface ChartConfig {
  id: string;
  chartType: 'line' | 'bar';
  metric: string;
  exercise: string | null;
  title: string;
  dateRange: number;
  customStartDate?: string;
  customEndDate?: string;
}

/**
 * Mixed chart data for complex visualizations
 */
export interface MixedChartData {
  labels: string[];
  datasets: Array<
    | ChartDataset<'line', number[]>
    | ChartDataset<'scatter', ScatterDataPoint[]>
    | ChartDataset<'bar', number[]>
  >;
}

/**
 * Generic chart data type for various chart types
 */
export type CustomChartData = 
  | ChartData<'line', number[], string> 
  | ChartData<'bar', number[], string>
  | {
      labels: string[];
      datasets: Array<
        | ChartDataset<'line', number[]>
        | ChartDataset<'scatter', ScatterDataPoint[]>
        | ChartDataset<'bar', number[]>
      >;
    };

/**
 * Exercise data grouped by date for charts
 */
export interface ExerciseDataByDate {
  [dateKey: string]: {
    date: string;
    formattedDate: string;
    sets: {
      setIndex: number;
      weight?: number;
      reps?: number;
      volume?: number;
      duration?: number;
      distance?: number;
      pace?: number;
    }[];
    dailyVolumeTotal?: number;
  };
}