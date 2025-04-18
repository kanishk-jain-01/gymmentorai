import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Schema for validating request body
const unitPreferencesSchema = z.object({
  weightUnit: z.enum(['lb', 'kg']).optional(),
  distanceUnit: z.enum(['mi', 'km', 'm']).optional(),
});

export async function GET(request: Request) {
  try {
    // Get the current session with auth options
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be signed in to view unit preferences' },
        { status: 401 }
      );
    }

    // Get the user's unit preferences
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { weightUnit: true, distanceUnit: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      weightUnit: user.weightUnit, 
      distanceUnit: user.distanceUnit 
    });
  } catch (error) {
    console.error('Error fetching unit preferences:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch unit preferences' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Get the current session with auth options
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be signed in to update unit preferences' },
        { status: 401 }
      );
    }

    // Parse and validate the request body
    const body = await request.json();
    const validatedData = unitPreferencesSchema.parse(body);

    // Update the user's unit preferences
    await prisma.user.update({
      where: { email: session.user.email },
      data: { 
        ...(validatedData.weightUnit && { weightUnit: validatedData.weightUnit }),
        ...(validatedData.distanceUnit && { distanceUnit: validatedData.distanceUnit }),
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating unit preferences:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update unit preferences' },
      { status: 500 }
    );
  }
} 