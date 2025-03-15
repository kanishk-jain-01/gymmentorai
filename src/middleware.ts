import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const { pathname } = request.nextUrl;
  
  // Check for session cookie - if it exists, we might have an active session
  const hasSessionCookie = request.cookies.has('next-auth.session-token') || 
                          request.cookies.has('__Secure-next-auth.session-token');
  
  // Get the token from the request
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  // If the user is not authenticated and doesn't have a session cookie, redirect to the sign-in page
  if (!token && !hasSessionCookie) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }
  
  // If the user has a session cookie but no token, they might be in the process of authenticating
  // Let them through to avoid redirect loops
  if (!token && hasSessionCookie) {
    return NextResponse.next();
  }
  
  // If the user is authenticated, allow the request
  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    '/log',
    '/log/:path*',
    '/visualization',
    '/visualization/:path*'
  ],
}; 