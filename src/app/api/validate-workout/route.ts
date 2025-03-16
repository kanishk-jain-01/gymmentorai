import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { checkApiUsageLimit, incrementApiUsage } from '@/lib/api-usage';
import OpenAI from 'openai';
import { z } from 'zod';

// Schema for input validation
const inputSchema = z.object({
  text: z.string().min(1, 'Text is required'),
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
    const { limitExceeded, currentCount, limit } = await checkApiUsageLimit(userId);
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
    
    // Use OpenAI to check if the text is workout-related
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a fitness expert assistant. Your task is to determine if the provided text is describing a workout or exercise activity. Respond with a JSON object with a single boolean field "isWorkoutRelated".'
        },
        {
          role: 'user',
          content: text
        }
      ],
      response_format: { type: 'json_object' },
    });
    
    // Increment API usage count
    await incrementApiUsage(userId);
    
    // Parse the response
    const content = response.choices[0]?.message?.content || '{"isWorkoutRelated": false}';
    const parsedContent = JSON.parse(content);
    
    return NextResponse.json({
      isWorkoutRelated: parsedContent.isWorkoutRelated
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 