import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
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

    // In a real implementation, you would verify the token
    // This is a simplified version - you should implement proper token verification
    // The token should be a signed value that can be verified to prevent abuse
    
    // For now, we'll just check if the user exists and update their preferences
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