import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { verifyUnsubscribeToken } from '@/lib/utils';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Schema for validating request query parameters
const unsubscribeSchema = z.object({
  email: z.string().email(),
  token: z.string()
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    // Validate the query parameters
    const validatedData = unsubscribeSchema.parse({ email, token });

    // Verify the token
    if (!verifyUnsubscribeToken(validatedData.email, validatedData.token)) {
      console.error('Invalid unsubscribe token');
      return NextResponse.redirect(new URL('/unsubscribe?status=error', request.url));
    }
    
    // Check if the user exists and update their preferences
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (!user) {
      // Return 200 even if user not found to prevent email enumeration
      return NextResponse.redirect(new URL('/unsubscribe?status=success', request.url));
    }

    // Update the user's email preferences
    await prisma.user.update({
      where: { email: validatedData.email },
      data: { subscribedToEmails: false }
    });

    // Redirect to a success page
    return NextResponse.redirect(new URL('/unsubscribe?status=success', request.url));
  } catch (error) {
    console.error('Error processing unsubscribe request:', error);
    
    // Redirect to an error page
    return NextResponse.redirect(new URL('/unsubscribe?status=error', request.url));
  }
} 