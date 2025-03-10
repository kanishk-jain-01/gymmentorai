import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { analyzeWorkouts } from '@/lib/ai/llm-service';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  try {
    // Try to get user ID from session
    let userId: string | null = null;
    
    try {
      // Check authentication - use try/catch to handle potential errors
      const session = await getServerSession(authOptions);
      console.log('GET /api/ai/analyze - Session:', session);
      
      if (session?.user) {
        userId = (session.user as any)?.id;
        console.log('User ID from session:', userId);
      }
    } catch (sessionError) {
      console.error('Error getting session:', sessionError);
    }
    
    if (!userId) {
      console.error('No user ID available');
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
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
      take: 10, // Limit to recent workouts for analysis
    });
    
    if (workouts.length === 0) {
      return NextResponse.json({ 
        analysis: "Not enough workout data to provide analysis. Please log more workouts." 
      });
    }
    
    // Format workout data for AI analysis
    const workoutData = workouts.map((workout: any) => ({
      date: workout.date.toISOString().split('T')[0],
      name: workout.name,
      duration: workout.duration,
      exercises: workout.exercises.map((exercise: any) => ({
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        weight: exercise.weight,
        duration: exercise.duration,
        distance: exercise.distance,
      })),
    }));
    
    // Get AI analysis
    const analysis = await analyzeWorkouts(workoutData);
    
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error analyzing workouts:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 