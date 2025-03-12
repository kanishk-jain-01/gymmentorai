import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { setupTrialPeriod } from '@/lib/stripe/subscription-service';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: NextRequest) {
  try {
    // Get user ID from session
    const session = await getServerSession(authOptions);
    const userId = session?.user ? (session.user as any)?.id : null;
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // First check if the user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!userExists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Then get the user with raw query to access trialEndsAt
    // This avoids TypeScript errors with the Prisma client
    const userData = await prisma.$queryRaw`
      SELECT "trialEndsAt" FROM "User" WHERE id = ${userId}
    `;
    
    const user = Array.isArray(userData) && userData.length > 0 ? userData[0] : null;
    
    if (!user) {
      return NextResponse.json({ error: 'User data not found' }, { status: 404 });
    }
    
    // If the user already has a trial period set, return it
    if (user.trialEndsAt) {
      return NextResponse.json({ 
        message: 'Trial period already set',
        trialEndsAt: user.trialEndsAt
      });
    }
    
    // Set up trial period
    const trialEndDate = await setupTrialPeriod(userId);
    
    return NextResponse.json({ 
      message: 'Trial period set up successfully',
      trialEndsAt: trialEndDate
    });
  } catch (error) {
    console.error('Error setting up trial period:', error);
    return NextResponse.json({ 
      error: 'Failed to set up trial period',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 