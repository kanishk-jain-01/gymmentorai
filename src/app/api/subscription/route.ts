import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getUserSubscriptionStatus, SUBSCRIPTION_PLANS } from '@/lib/stripe/subscription-service';
import { formatPrice } from '@/lib/stripe/stripe-server';

export async function GET(req: NextRequest) {
  try {
    // Get user ID from session
    const session = await getServerSession(authOptions);
    const userId = session?.user ? (session.user as any)?.id : null;
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Get subscription status
    const status = await getUserSubscriptionStatus(userId);
    
    // Get available plans with formatted prices
    const plans = SUBSCRIPTION_PLANS.map(plan => ({
      ...plan,
      formattedPrice: formatPrice(plan.price),
    }));
    
    return NextResponse.json({ status, plans });
  } catch (error) {
    console.error('Subscription status error:', error);
    return NextResponse.json({ 
      error: 'Failed to get subscription status',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 