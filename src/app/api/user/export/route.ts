import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  try {
    // Get user ID from session
    const session = await getServerSession(authOptions);
    const userId = session?.user ? (session.user as any)?.id : null;
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Get user data
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        workouts: {
          include: {
            exercises: true,
          },
          orderBy: {
            date: 'desc',
          },
        },
      },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Prepare data for export
    const exportData = {
      user: {
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      workouts: user.workouts.map(workout => ({
        id: workout.id,
        date: workout.date,
        name: workout.name,
        notes: workout.notes,
        duration: workout.duration,
        rawInput: workout.rawInput,
        createdAt: workout.createdAt,
        updatedAt: workout.updatedAt,
        exercises: workout.exercises.map(exercise => ({
          id: exercise.id,
          name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight,
          duration: exercise.duration,
          distance: exercise.distance,
          notes: exercise.notes,
          createdAt: exercise.createdAt,
          updatedAt: exercise.updatedAt,
        })),
      })),
    };
    
    // Set headers for file download
    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="gymmentor-data-export-${new Date().toISOString().split('T')[0]}.json"`);
    headers.set('Content-Type', 'application/json');
    
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error exporting user data:', error);
    return NextResponse.json({ 
      error: 'Failed to export user data',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 