import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe/stripe-server';

export async function DELETE(req: NextRequest) {
  try {
    // Get user ID from session
    const session = await getServerSession(authOptions);
    const userId = session?.user ? (session.user as any)?.id : null;
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Get user data to check for Stripe customer ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // If the user has a Stripe subscription, cancel it
    if ((user as any).stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel((user as any).stripeSubscriptionId);
      } catch (stripeError) {
        console.error('Error canceling Stripe subscription:', stripeError);
        // Continue with account deletion even if subscription cancellation fails
      }
    }
    
    // Delete the user's data
    await prisma.$transaction([
      // Delete all exercises associated with the user's workouts
      prisma.exercise.deleteMany({
        where: {
          workout: {
            userId,
          },
        },
      }),
      
      // Delete all workouts
      prisma.workout.deleteMany({
        where: {
          userId,
        },
      }),
      
      // Delete all sessions
      prisma.session.deleteMany({
        where: {
          userId,
        },
      }),
      
      // Delete all accounts
      prisma.account.deleteMany({
        where: {
          userId,
        },
      }),
      
      // Finally, delete the user
      prisma.user.delete({
        where: {
          id: userId,
        },
      }),
    ]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete account',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 