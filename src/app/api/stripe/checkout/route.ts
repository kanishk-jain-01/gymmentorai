import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createCheckoutSession } from '@/lib/stripe/subscription-service';
import { z } from 'zod';

// Schema for checkout request validation
const checkoutSchema = z.object({
  priceId: z.string().min(1, 'Price ID is required'),
});

export async function POST(req: NextRequest) {
  try {
    // Get user ID from session
    const session = await getServerSession(authOptions);
    const userId = session?.user ? (session.user as any)?.id : null;
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Parse request body
    const body = await req.json();
    
    // Validate input
    const result = checkoutSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors }, { status: 400 });
    }
    
    const { priceId } = result.data;
    
    // Get the return URL from the request or use a default
    const returnUrl = req.headers.get('referer') || process.env.NEXTAUTH_URL || 'http://localhost:3000/account';
    
    // Create checkout session
    const checkoutSession = await createCheckoutSession({
      userId,
      priceId,
      returnUrl,
    });
    
    return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ 
      error: 'Failed to create checkout session',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 