import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createPortalSession } from '@/lib/stripe/subscription-service';

export async function POST(req: NextRequest) {
  try {
    // Get user ID from session
    const session = await getServerSession(authOptions);
    const userId = session?.user ? (session.user as any)?.id : null;
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Get the return URL from the request or use a default
    const returnUrl = req.headers.get('referer') || process.env.NEXTAUTH_URL || 'http://localhost:3000/account';
    
    // Create portal session
    const portalSession = await createPortalSession({
      userId,
      returnUrl,
    });
    
    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Portal error:', error);
    return NextResponse.json({ 
      error: 'Failed to create portal session',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 