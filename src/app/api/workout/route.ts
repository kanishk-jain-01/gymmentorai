import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { parseWorkoutText } from '@/lib/ai/openai';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// Schema for workout input validation
const workoutInputSchema = z.object({
  text: z.string().min(1, 'Workout description is required'),
});

// Single mock workout for development
const mockWorkouts = [
  {
    id: 'mock-workout-1',
    date: new Date().toISOString(),
    name: 'Morning Workout',
    notes: 'Felt good today',
    duration: 60,
    userId: 'dev-user-id',
    exercises: [
      {
        id: 'mock-exercise-1',
        name: 'Bench Press',
        sets: 3,
        reps: 10,
        weight: 185,
        workoutId: 'mock-workout-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'mock-exercise-2',
        name: 'Squats',
        sets: 3,
        reps: 8,
        weight: 225,
        workoutId: 'mock-workout-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    
    // Validate input
    const result = workoutInputSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors }, { status: 400 });
    }
    
    const { text } = result.data;
    
    // In development, use mock data or process with Ollama
    if (process.env.NODE_ENV !== 'production') {
      try {
        // Try to parse with Ollama if configured
        if (process.env.OLLAMA_URL) {
          console.log('Using Ollama for workout parsing in development');
          const parsedWorkout = await parseWorkoutText(text);
          
          const workout = {
            id: uuidv4(),
            date: parsedWorkout.date.toISOString(),
            name: parsedWorkout.name || 'New Workout',
            notes: parsedWorkout.notes || 'Created from user input',
            duration: parsedWorkout.duration || 45,
            userId: 'dev-user-id',
            exercises: parsedWorkout.exercises.map(exercise => ({
              id: uuidv4(),
              name: exercise.name,
              sets: exercise.sets || 3,
              reps: exercise.reps || 10,
              weight: exercise.weight || 150,
              duration: exercise.duration,
              distance: exercise.distance,
              notes: exercise.notes,
              workoutId: uuidv4(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          // Add to mock workouts
          mockWorkouts.unshift(workout);
          
          return NextResponse.json({ workout }, { status: 201 });
        } else {
          // Fall back to mock data if Ollama is not configured
          const mockWorkout = {
            id: uuidv4(),
            date: new Date().toISOString(),
            name: 'New Workout',
            notes: 'Created from user input',
            duration: 45,
            userId: 'dev-user-id',
            exercises: [
              {
                id: uuidv4(),
                name: 'Exercise from user input',
                sets: 3,
                reps: 10,
                weight: 150,
                workoutId: uuidv4(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          // Add to mock workouts
          mockWorkouts.unshift(mockWorkout);
          
          return NextResponse.json({ workout: mockWorkout }, { status: 201 });
        }
      } catch (error) {
        console.error('Error in development mode:', error);
        return NextResponse.json({ error: 'Failed to process workout in development mode' }, { status: 500 });
      }
    }
    
    // In production, check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse workout text using AI
    const parsedWorkout = await parseWorkoutText(text);
    
    // Get user ID from session
    const userId = (session?.user as any)?.id as string;
    
    // Create workout in database
    const workout = await prisma.workout.create({
      data: {
        name: parsedWorkout.name,
        date: parsedWorkout.date,
        duration: parsedWorkout.duration,
        notes: parsedWorkout.notes,
        rawInput: text,
        userId,
        exercises: {
          create: parsedWorkout.exercises.map(exercise => ({
            name: exercise.name,
            sets: exercise.sets,
            reps: exercise.reps,
            weight: exercise.weight,
            duration: exercise.duration,
            distance: exercise.distance,
            notes: exercise.notes,
          })),
        },
      },
      include: {
        exercises: true,
      },
    });
    
    return NextResponse.json({ workout }, { status: 201 });
  } catch (error) {
    console.error('Error processing workout:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // In development, return mock data
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ workouts: mockWorkouts });
    }
    
    // In production, check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user ID from session
    const userId = (session.user as any).id as string;
    
    // Get workouts for the user
    const workouts = await prisma.workout.findMany({
      where: {
        userId,
      },
      include: {
        exercises: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
    
    return NextResponse.json({ workouts });
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 