import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { analyzeWorkouts } from '@/lib/ai/openai';

export async function GET(req: NextRequest) {
  try {
    // Check authentication
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
      take: 10, // Limit to recent workouts for analysis
    });
    
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 