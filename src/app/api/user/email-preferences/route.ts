import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Schema for validating request body
const emailPreferencesSchema = z.object({
  subscribedToEmails: z.boolean()
});

export async function GET(request: Request) {
  try {
    // Get the current session with auth options
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be signed in to view email preferences' },
        { status: 401 }
      );
    }

    // Get the user's email preferences
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { subscribedToEmails: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ subscribedToEmails: user.subscribedToEmails });
  } catch (error) {
    console.error('Error fetching email preferences:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch email preferences' },
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
        { error: 'You must be signed in to update email preferences' },
        { status: 401 }
      );
    }

    // Parse and validate the request body
    const body = await request.json();
    const validatedData = emailPreferencesSchema.parse(body);

    // Update the user's email preferences
    await prisma.user.update({
      where: { email: session.user.email },
      data: { subscribedToEmails: validatedData.subscribedToEmails }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating email preferences:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update email preferences' },
      { status: 500 }
    );
  }
} 