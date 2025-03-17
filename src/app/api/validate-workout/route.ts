import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { validateWorkoutText, checkLlmUsageLimit, incrementLlmUsage } from '@/lib/ai';
import { z } from 'zod';

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
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Check API usage limit
    const { limitExceeded, currentCount, limit } = await checkLlmUsageLimit(userId);
    if (limitExceeded) {
      return NextResponse.json({ 
        error: 'API limit exceeded',
        message: `You have reached your daily API request limit. Please try again tomorrow.`,
        code: 'API_LIMIT_EXCEEDED'
      }, { status: 429 });
    }
    
    // Parse request body
    const body = await req.json();
    
    // Validate input
    const result = inputSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors }, { status: 400 });
    }
    
    const { text } = result.data;
    
    try {
      // Use our AI module to validate the workout text
      const isWorkoutRelated = await validateWorkoutText(text);
      
      // Increment API usage count
      await incrementLlmUsage(userId);
      
      return NextResponse.json({
        isWorkoutRelated
      });
    } catch (error) {
      return NextResponse.json({ 
        error: 'Failed to validate workout text',
        details: error instanceof Error ? error.message : String(error)
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 