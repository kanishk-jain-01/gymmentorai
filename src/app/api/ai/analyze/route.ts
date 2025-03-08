import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Mock analysis for development
const mockAnalysis = `
Based on your recent workouts, here's an analysis of your fitness journey:

Strengths:
- Consistent training frequency with regular workouts
- Good balance between upper and lower body exercises
- Progressive overload on key lifts like bench press and squats

Areas for improvement:
- Consider adding more variety to your routine
- Your workout duration is good, but you might benefit from shorter, more intense sessions
- Try to increase weight on bench press by 5-10 lbs in the next few weeks

Keep up the good work! Your consistency is the key to long-term progress.
`;

export async function GET(req: NextRequest) {
  try {
    // Skip authentication check in development
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
    
    let analysis;
    
    // If in development or OpenAI client is not available, use mock analysis
    if (process.env.NODE_ENV !== 'production' || !openai) {
      analysis = mockAnalysis;
    } else {
      try {
        // Get AI analysis
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are a fitness coach analyzing workout data. 
              Provide insights, trends, and recommendations based on the user's recent workouts.
              Focus on progress, consistency, exercise balance, and potential areas for improvement.
              Keep your analysis concise but informative, with actionable advice.`
            },
            {
              role: "user",
              content: JSON.stringify(workoutData)
            }
          ],
        });
        
        analysis = response.choices[0].message.content;
      } catch (aiError) {
        console.error('Error calling OpenAI API:', aiError);
        analysis = "Sorry, we couldn't generate an analysis at this time. Please try again later.";
      }
    }
    
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error analyzing workouts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 