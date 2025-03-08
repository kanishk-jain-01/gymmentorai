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
    let userId = 'dev-user-id';
    
    // In production, check authentication
    if (process.env.NODE_ENV === 'production') {
      const session = await getServerSession();
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      // Get user ID from session
      userId = (session.user as any)?.id as string;
    }
    
    try {
      // Parse workout text using AI
      console.log('Parsing workout text with AI');
      const parsedWorkout = await parseWorkoutText(text);
      
      // Create workout in database
      console.log('Creating workout in database');
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
      
      // In development, also add to mock workouts for fallback
      if (process.env.NODE_ENV !== 'production') {
        const mockWorkout = {
          id: workout.id,
          date: workout.date.toISOString(),
          name: workout.name || 'New Workout',
          notes: workout.notes || 'Created from user input',
          duration: workout.duration || 45,
          userId: workout.userId,
          exercises: workout.exercises.map(ex => ({
            id: ex.id,
            name: ex.name,
            sets: ex.sets || 3,
            reps: ex.reps || 10,
            weight: ex.weight || 150,
            workoutId: workout.id,
            createdAt: ex.createdAt.toISOString(),
            updatedAt: ex.updatedAt.toISOString(),
          })),
          createdAt: workout.createdAt.toISOString(),
          updatedAt: workout.updatedAt.toISOString(),
        };
        
        mockWorkouts.unshift(mockWorkout);
      }
      
      return NextResponse.json({ workout }, { status: 201 });
    } catch (error) {
      console.error('Error processing workout:', error);
      
      // In development, fall back to mock data if database operation fails
      if (process.env.NODE_ENV !== 'production') {
        console.log('Falling back to mock data in development due to error:', error);
        
        const mockWorkout = {
          id: uuidv4(),
          date: new Date().toISOString(),
          name: 'New Workout (Mock Fallback)',
          notes: 'Created from user input (database operation failed)',
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
      
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error processing workout:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    let userId = 'dev-user-id';
    
    // In production, check authentication
    if (process.env.NODE_ENV === 'production') {
      const session = await getServerSession();
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      // Get user ID from session
      userId = (session.user as any).id as string;
    }
    
    try {
      // Get workouts from database
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
    } catch (dbError) {
      console.error('Error fetching workouts from database:', dbError);
      
      // In development, fall back to mock data if database query fails
      if (process.env.NODE_ENV !== 'production') {
        console.log('Falling back to mock data in development');
        return NextResponse.json({ workouts: mockWorkouts });
      }
      
      throw dbError; // Re-throw in production
    }
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 