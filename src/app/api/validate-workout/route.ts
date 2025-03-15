import { NextResponse } from 'next/server';
import { isWorkoutRelated } from '@/lib/ai/llm-service';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input: text is required' },
        { status: 400 }
      );
    }
    
    const isValid = await isWorkoutRelated(text);
    
    return NextResponse.json({ isWorkoutRelated: isValid });
  } catch (error) {
    console.error('Workout validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate workout' },
      { status: 500 }
    );
  }
} 