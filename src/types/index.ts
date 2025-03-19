import { Session } from 'next-auth';
import { ChartData, ChartDataset, ScatterDataPoint } from 'chart.js';

/*******************************************************************************
 * DOMAIN MODELS
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
    }[];
    dailyVolumeTotal?: number;
  };
}

/**
 * Workout duration data grouped by date
 */
export interface WorkoutDurationsByDate {
  [dateKey: string]: {
    date: string;
    formattedDate: string;
    duration: number;
  }[];
}

/*******************************************************************************
 * AI SERVICE TYPES
 ******************************************************************************/

export interface ToolCall {
  name: string;
  arguments: string;
}

export interface ToolResult {
  name: string;
  content: string;
}

export interface FormData {
  rawInput: string;
}

/*******************************************************************************
 * COMPONENT PROPS
 ******************************************************************************/

/**
 * Layout Props
 */
export interface LayoutProps {
  children: React.ReactNode;
}

/**
 * User & Authentication Component Props
 */
export interface ProfileDropdownProps {
  user: UserWithSubscription;
}

export interface SubscriptionStatusProps {
  onSubscriptionChange?: (status: SubscriptionStatus) => void;
}

/**
 * Workout Editor Component Props
 */
export interface WorkoutListProps {
  workouts: Workout[];
  isLoading: boolean;
  onWorkoutUpdated: () => void;
}

export interface WorkoutEditorProps {
  workout: Workout;
  onClose: () => void;
  onWorkoutUpdated: () => void;
}

export interface ExerciseEditorProps {
  exerciseIndex: number;
  control: any;
  register: any;
  errors: any;
  removeExercise: (index: number) => void;
}

export interface SetEditorProps {
  exerciseIndex: number;
  setIndex: number;
  register: any;
  removeSet: (index: number) => void;
}

export interface WorkoutFormHeaderProps {
  register: any;
  errors: any;
}

export interface WorkoutFormActionsProps {
  isLoading: boolean;
  deleteConfirmState: boolean;
  handleDeleteWorkout: () => void;
  onClose: () => void;
  setDeleteConfirmState: (state: boolean) => void;
}

export interface WorkoutInputProps {
  onWorkoutAdded: () => void;
}

/**
 * Chart Component Props
 */
export interface ChartConfigProps {
  config: ChartConfig;
  exerciseOptions: string[];
  onUpdateConfig: (field: keyof ChartConfig, value: any) => void;
}

export interface ChartRendererProps {
  config: ChartConfig;
  chartData: ChartData<any, any[], any> | MixedChartData;
  height?: number;
}

export interface CustomChartProps {
  config: ChartConfig;
  workouts: Workout[];
  exerciseOptions: string[];
  personalRecords: Record<string, { weight: number, date: string }>;
  onUpdateConfig: (id: string, field: keyof ChartConfig, value: any) => void;
  onRemoveChart: (id: string) => void;
}

export interface WorkoutSummaryProps {
  workouts: Workout[];
  exerciseOptions: string[];
}

export interface WorkoutFrequencyChartProps {
  workouts: Workout[];
}

/**
 * Page Component Props
 */
export interface YearPageProps {
  params: {
    year: string;
  };
}

export interface MonthPageProps {
  params: {
    year: string;
    month: string;
  };
}

/**
 * UI Component Props
 */
export interface TimeCardProps {
  title: string;
  count: number;
  href: string;
}

export interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
} 