import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { parseWorkoutText } from '@/lib/ai/llm-service';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ensureNumericType } from '@/lib/utils';

// Schema for workout input validation
const workoutInputSchema = z.object({
  text: z.string().min(1, 'Workout description is required'),
});

// Helper function removed and imported from utils

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
      // Append today's date to the input text
      const today = new Date().toISOString().split('T')[0]; // Gets date in YYYY-MM-DD format
      const textWithDate = `${text} on ${today}`;

      // Parse workout text using AI
      const parsedWorkout = await parseWorkoutText(textWithDate);
      
      // Create a date object at noon UTC for this calendar date to avoid any timezone issues
      const todayDate = new Date(`${today}T12:00:00Z`);
      
      // Create workout in database
      const workoutData = {
        name: parsedWorkout.name,
        date: todayDate,
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
    
    // Format dates to ensure they're interpreted correctly by the client
    const formattedWorkouts = workouts.map(workout => {
      // Extract just the date part (YYYY-MM-DD) to make it timezone-agnostic
      const dateStr = workout.date.toISOString().split('T')[0];
      
      return {
        ...workout,
        date: dateStr,
      };
    });
    
    return NextResponse.json({ workouts: formattedWorkouts });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 