import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { parseWorkoutText } from '@/lib/ai/llm-service';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Schema for workout input validation
const workoutInputSchema = z.object({
  text: z.string().min(1, 'Workout description is required'),
});

// Helper function to ensure numeric values are properly converted
function ensureNumericType(value: any): number | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  
  // Convert string to number
  const num = Number(value);
  
  // Return undefined if not a valid number
  return isNaN(num) ? undefined : num;
}

export async function POST(req: NextRequest) {
  try {
    // Get user ID from session
    const session = await getServerSession(authOptions);
    const userId = session?.user ? (session.user as any)?.id : null;
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Parse request body
    const body = await req.json();
    
    // Validate input
    const result = workoutInputSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors }, { status: 400 });
    }
    
    const { text } = result.data;
    
    try {
      // Parse workout text using AI
      const parsedWorkout = await parseWorkoutText(text);
      
      // Create workout in database
      const workoutData = {
        name: parsedWorkout.name,
        date: parsedWorkout.date,
        duration: ensureNumericType(parsedWorkout.duration),
        notes: parsedWorkout.notes,
        rawInput: text,
        userId,
        exercises: {
          create: parsedWorkout.exercises.map(exercise => ({
            name: exercise.name,
            sets: ensureNumericType(exercise.sets),
            reps: ensureNumericType(exercise.reps),
            weight: ensureNumericType(exercise.weight),
            duration: ensureNumericType(exercise.duration),
            distance: ensureNumericType(exercise.distance),
            notes: exercise.notes,
          })),
        },
      };
      
      const workout = await prisma.workout.create({
        data: workoutData,
        include: {
          exercises: true,
        },
      });
      
      return NextResponse.json({ workout }, { status: 201 });
    } catch (error) {
      return NextResponse.json({ 
        error: 'Failed to process workout',
        details: error instanceof Error ? error.message : String(error)
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get user ID from session
    const session = await getServerSession(authOptions);
    const userId = session?.user ? (session.user as any)?.id : null;
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
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
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 