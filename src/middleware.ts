import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const { pathname } = request.nextUrl;
  
  // Log the request for debugging
  console.log(`Middleware processing: ${pathname}`);
  
  // Get the token from the request
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  console.log(`Token found: ${!!token}, User ID: ${token?.sub || 'none'}`);
  
  // If the user is not authenticated, redirect to the sign-in page
  if (!token) {
    console.log(`No token found, redirecting to sign-in page with callback: ${pathname}`);
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
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