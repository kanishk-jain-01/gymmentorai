import { ChartData, ChartDataset, ScatterDataPoint } from 'chart.js';
import { Workout } from '@/types';
import { ChartConfig } from '../chartUtils';

// Define a type for mixed chart data
export interface MixedChartData {
  labels: string[];
  datasets: Array<
    | ChartDataset<'line', number[]>
    | ChartDataset<'scatter', ScatterDataPoint[]>
    | ChartDataset<'bar', number[]>
  >;
}

export interface CustomChartProps {
  config: ChartConfig;
  workouts: Workout[];
  exerciseOptions: string[];
  personalRecords: Record<string, { weight: number, date: string }>;
  onUpdateConfig: (id: string, field: keyof ChartConfig, value: any) => void;
  onRemoveChart: (id: string) => void;
}

// Exercise data grouped by date
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
  };
}

// Workout duration data grouped by date
export interface WorkoutDurationsByDate {
  [dateKey: string]: {
    date: string;
    formattedDate: string;
    duration: number;
  }[];
} 