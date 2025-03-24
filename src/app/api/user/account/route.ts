import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe/stripe-server';
import { hasActiveSubscription } from '@/lib/stripe/stripe-server';
import { formatDate } from '@/lib/utils';

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
      select: {
        id: true,
        stripeSubscriptionId: true,
        stripeCurrentPeriodEnd: true,
        cancelAtPeriodEnd: true,
      }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check if the user has an active subscription (regardless of cancellation status)
    const hasActiveSubscriptionPeriod = hasActiveSubscription(user.stripeCurrentPeriodEnd);
    
    if (hasActiveSubscriptionPeriod) {
      // If subscription is active but set to cancel, inform user they need to wait
      if (user.cancelAtPeriodEnd) {
        const formattedDate = user.stripeCurrentPeriodEnd 
          ? formatDate(user.stripeCurrentPeriodEnd) 
          : 'the end of your billing period';
          
        return NextResponse.json({ 
          error: 'Cannot delete account with active subscription period', 
          message: `Your subscription is set to cancel, but you need to wait until it expires on ${formattedDate} before deleting your account.`,
          code: 'ACTIVE_SUBSCRIPTION_PERIOD',
          expiryDate: user.stripeCurrentPeriodEnd
        }, { status: 400 });
      } 
      // If subscription is active and not set to cancel, inform user they need to cancel first
      else {
        return NextResponse.json({ 
          error: 'Cannot delete account with active subscription', 
          message: 'Please cancel your subscription before deleting your account. You can do this by going to Account Settings > Subscription > Manage Subscription.',
          code: 'ACTIVE_SUBSCRIPTION'
        }, { status: 400 });
      }
    }
    
    // If the user has a Stripe subscription that's already set to cancel, cancel it immediately
    if (user.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel(user.stripeSubscriptionId);
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