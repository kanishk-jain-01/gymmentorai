import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { parseWorkoutText } from '@/lib/ai/openai';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for workout input validation
const workoutInputSchema = z.object({
  text: z.string().min(1, 'Workout description is required'),
});

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user ID from session
    const userId = (session.user as any)?.id;
    
    if (!userId) {
      console.error('User ID not found in session:', session);
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 400 });
    }
    
    console.log('User ID from session:', userId);
    
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
      console.log('Parsing workout text with AI');
      const parsedWorkout = await parseWorkoutText(text);
      
      // Create workout in database
      console.log(`Creating workout in database for user: ${userId}`);
      
      // Debug the data being sent to Prisma
      const workoutData = {
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
      };
      
      console.log('Workout data:', JSON.stringify(workoutData, null, 2));
      
      const workout = await prisma.workout.create({
        data: workoutData,
        include: {
          exercises: true,
        },
      });
      
      return NextResponse.json({ workout }, { status: 201 });
    } catch (error) {
      console.error('Error processing workout:', error);
      return NextResponse.json({ 
        error: 'Failed to process workout',
        details: error instanceof Error ? error.message : String(error)
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error processing workout:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user ID from session
    const userId = (session.user as any).id;
    
    if (!userId) {
      console.error('User ID not found in session:', session);
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 400 });
    }
    
    // Get workouts from database
    console.log(`Fetching workouts for user: ${userId}`);
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
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 