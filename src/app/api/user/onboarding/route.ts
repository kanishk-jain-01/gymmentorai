import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: Request) {
  try {
    // Get the current session with auth options
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be signed in to check onboarding status' },
        { status: 401 }
      );
    }

    // Get the user's onboarding status
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { hasSeenOnboarding: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ hasSeenOnboarding: user.hasSeenOnboarding });
  } catch (error) {
    console.error('Error fetching onboarding status:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch onboarding status' },
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
        { error: 'You must be signed in to update onboarding status' },
        { status: 401 }
      );
    }

    // Update the user's onboarding status
    await prisma.user.update({
      where: { email: session.user.email },
      data: { hasSeenOnboarding: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating onboarding status:', error);
    
    return NextResponse.json(
      { error: 'Failed to update onboarding status' },
      { status: 500 }
    );
  }
} 