import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { validateWorkoutText, checkLlmUsageLimit, incrementLlmUsage } from '@/lib/ai';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { UserWithSubscription } from '@/types';
import { canAddWorkouts } from '@/lib/stripe/stripe-server';

// Schema for input validation
const inputSchema = z.object({
  text: z.string().min(1, 'Text is required'),
});

export async function POST(req: NextRequest) {
  try {
    // Get user ID from session
    const session = await getServerSession(authOptions);
    const userId = session?.user ? (session.user as any)?.id : null;
    
    if (!userId) {
      return NextResponse.json({ 
        status: 'error',
        reason: 'authentication',
        message: 'Authentication required' 
      }, { status: 401 });
    }
    
    // Check if the user can add workouts based on subscription status
    const user = await prisma.user.findUnique({
      where: { id: userId },
    }) as unknown as UserWithSubscription;
    
    if (!user) {
      return NextResponse.json({ 
        status: 'error',
        reason: 'user_not_found',
        message: 'User not found' 
      }, { status: 404 });
    }
    
    // Check if the user can add workouts before proceeding with LLM validation
    if (!canAddWorkouts(user.trialEndsAt, user.stripeCurrentPeriodEnd)) {
      return NextResponse.json({ 
        status: 'error',
        reason: 'subscription_required',
        message: 'Your trial period has ended. Please subscribe to continue adding workouts.'
      }, { status: 200 }); // Use 200 to avoid error handling in client
    }
    
    // Check API usage limit
    const { limitExceeded, currentCount, limit } = await checkLlmUsageLimit(userId);
    if (limitExceeded) {
      return NextResponse.json({ 
        status: 'error',
        reason: 'api_limit_exceeded',
        message: `You have reached your daily API request limit. Please try again tomorrow.`
      }, { status: 200 }); // Use 200 to avoid error handling in client
    }
    
    // Parse request body
    const body = await req.json();
    
    // Validate input
    const result = inputSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ 
        status: 'error',
        reason: 'validation_failed',
        message: 'Invalid input data'
      }, { status: 200 });
    }
    
    const { text } = result.data;
    
    try {
      // Use our AI module to validate the workout text
      const isWorkoutRelated = await validateWorkoutText(text);
      
      // Increment API usage count
      await incrementLlmUsage(userId);
      
      return NextResponse.json({
        status: 'success',
        isWorkoutRelated
      });
    } catch (error) {
      return NextResponse.json({ 
        status: 'error',
        reason: 'validation_failed',
        message: 'Failed to validate workout text'
      }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({ 
      status: 'error',
      reason: 'server_error',
      message: 'Internal server error'
    }, { status: 500 });
  }
} 