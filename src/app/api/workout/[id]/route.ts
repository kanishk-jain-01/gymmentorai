import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ensureNumericType } from '@/lib/utils';

// Schema for workout update validation
const workoutUpdateSchema = z.object({
  name: z.string().optional(),
  date: z.string().optional(),
  duration: z.number().optional().nullable(),
  notes: z.string().optional(),
  exercises: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string(),
      sets: z.number().optional().nullable(),
      reps: z.number().optional().nullable(),
      weight: z.number().optional().nullable(),
      duration: z.number().optional().nullable(),
      distance: z.number().optional().nullable(),
      notes: z.string().optional(),
    })
  ),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure params is properly handled
    const workoutId = params.id;
    
    // Get user ID from session
    const session = await getServerSession(authOptions);
    const userId = session?.user ? (session.user as any)?.id : null;
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Check if workout exists and belongs to the user
    const existingWorkout = await prisma.workout.findUnique({
      where: {
        id: workoutId,
        userId,
      },
    });
    
    if (!existingWorkout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }
    
    // Parse request body
    const body = await req.json();
    
    // Validate input
    const result = workoutUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors }, { status: 400 });
    }
    
    const { name, date, duration, notes, exercises } = result.data;
    
    // Create a date object at noon UTC for this calendar date to avoid any timezone issues
    const workoutDate = date ? new Date(`${date}T12:00:00Z`) : undefined;
    
    // Update workout in database
    const updatedWorkout = await prisma.$transaction(async (tx) => {
      // Update the workout
      const workout = await tx.workout.update({
        where: {
          id: workoutId,
        },
        data: {
          name,
          date: workoutDate,
          duration: ensureNumericType(duration),
          notes,
        },
      });
      
      // Delete existing exercises
      await tx.exercise.deleteMany({
        where: {
          workoutId,
        },
      });
      
      // Create new exercises
      const exercisePromises = exercises.map(exercise => 
        tx.exercise.create({
          data: {
            name: exercise.name,
            sets: ensureNumericType(exercise.sets),
            reps: ensureNumericType(exercise.reps),
            weight: ensureNumericType(exercise.weight),
            duration: ensureNumericType(exercise.duration),
            distance: ensureNumericType(exercise.distance),
            notes: exercise.notes,
            workoutId,
          },
        })
      );
      
      const createdExercises = await Promise.all(exercisePromises);
      
      return {
        ...workout,
        exercises: createdExercises,
      };
    });
    
    return NextResponse.json({ workout: updatedWorkout });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure params is properly handled
    const workoutId = params.id;
    
    // Get user ID from session
    const session = await getServerSession(authOptions);
    const userId = session?.user ? (session.user as any)?.id : null;
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Check if workout exists and belongs to the user
    const existingWorkout = await prisma.workout.findUnique({
      where: {
        id: workoutId,
        userId,
      },
    });
    
    if (!existingWorkout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }
    
    // Delete workout and its exercises (cascade delete is configured in the schema)
    await prisma.workout.delete({
      where: {
        id: workoutId,
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 