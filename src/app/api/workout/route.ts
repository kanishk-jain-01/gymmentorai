import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { parseWorkoutText } from '@/lib/ai/llm-service';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ensureNumericType } from '@/lib/utils';
import { canAddWorkouts } from '@/lib/stripe/stripe-server';
import { UserWithSubscription } from '@/types';
import { checkApiUsageLimit, incrementApiUsage } from '@/lib/api-usage';

// Schema for workout input validation
const workoutInputSchema = z.object({
  text: z.string().min(1, 'Workout description is required'),
});

export async function POST(req: NextRequest) {
  try {
    // Get user ID from session
    const session = await getServerSession(authOptions);
    const userId = session?.user ? (session.user as any)?.id : null;
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Check API usage limit
    const { limitExceeded, currentCount, limit } = await checkApiUsageLimit(userId);
    if (limitExceeded) {
      return NextResponse.json({ 
        error: 'API limit exceeded',
        message: `You have reached your daily API request limit. Please try again tomorrow.`,
        code: 'API_LIMIT_EXCEEDED'
      }, { status: 429 });
    }
    
    // Check if the user can add workouts based on subscription status
    const user = await prisma.user.findUnique({
      where: { id: userId },
    }) as unknown as UserWithSubscription;
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check if the user can add workouts
    if (!canAddWorkouts(user.trialEndsAt, user.stripeCurrentPeriodEnd)) {
      return NextResponse.json({ 
        error: 'Subscription required',
        message: 'Your trial period has ended. Please subscribe to continue adding workouts.',
        code: 'SUBSCRIPTION_REQUIRED'
      }, { status: 403 });
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
      // Parse workout text using AI (without appending date)
      const parsedWorkout = await parseWorkoutText(text);
      
      // Increment API usage count
      await incrementApiUsage(userId);
      
      // Create workout in database with current date/time
      const workoutData = {
        name: parsedWorkout.name,
        date: parsedWorkout.date, // Just use the current date/time without any formatting
        duration: ensureNumericType(parsedWorkout.duration),
        notes: parsedWorkout.notes,
        rawInput: text,
        userId,
        exercises: {
          create: parsedWorkout.exercises.map(exercise => ({
            name: exercise.name,
            notes: exercise.notes,
            sets: {
              create: exercise.sets.map(set => ({
                reps: ensureNumericType(set.reps),
                weight: ensureNumericType(set.weight),
                duration: ensureNumericType(set.duration),
                distance: ensureNumericType(set.distance),
                notes: set.notes,
              })),
            },
          })),
        },
      };
      
      const workout = await prisma.workout.create({
        data: workoutData,
        include: {
          exercises: {
            include: {
              sets: true,
            },
          },
        },
      });
      
      return NextResponse.json({ 
        workout
      }, { status: 201 });
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
        exercises: {
          include: {
            sets: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
      take: 3, // Limit to the three most recent workouts
    });
    
    // Return workouts without any date formatting
    return NextResponse.json({ workouts });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 