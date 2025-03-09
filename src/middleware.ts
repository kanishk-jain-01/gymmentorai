import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const { pathname } = request.nextUrl;
  
  // Log the request for debugging
  console.log(`Middleware processing: ${pathname}`);
  
  // Check for session cookie - if it exists, we might have an active session
  const hasSessionCookie = request.cookies.has('next-auth.session-token') || 
                          request.cookies.has('__Secure-next-auth.session-token');
  
  // Get the token from the request
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  console.log(`Token found: ${!!token}, Has session cookie: ${hasSessionCookie}, User ID: ${token?.sub || 'none'}`);
  
  // If the user is not authenticated and doesn't have a session cookie, redirect to the sign-in page
  if (!token && !hasSessionCookie) {
    console.log(`No authentication found, redirecting to sign-in page with callback: ${pathname}`);
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }
  
  // If the user has a session cookie but no token, they might be in the process of authenticating
  // Let them through to avoid redirect loops
  if (!token && hasSessionCookie) {
    console.log(`Session cookie found but no token yet, allowing access to: ${pathname}`);
    return NextResponse.next();
  }
  
  // If the user is authenticated, allow the request
  console.log(`User authenticated, proceeding to: ${pathname}`);
  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/visualization',
    '/visualization/:path*'
  ],
}; 