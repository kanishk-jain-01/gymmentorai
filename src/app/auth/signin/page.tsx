'use client';

import { signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const [callbackUrl, setCallbackUrl] = useState('/dashboard');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    // Check if we're being redirected from somewhere
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const redirectUrl = urlParams.get('callbackUrl');
      if (redirectUrl) {
        console.log('Setting callback URL to:', redirectUrl);
        setCallbackUrl(redirectUrl);
      }
    }
  }, []);

  const handleSignIn = async () => {
    setIsRedirecting(true);
    console.log('Signing in with Google, callback URL:', callbackUrl);
    
    try {
      const result = await signIn('google', { 
        callbackUrl,
        redirect: true
      });
      
      console.log('Sign-in result:', result);
      
      // If signIn returns (it shouldn't with redirect: true)
      if (result?.ok && result?.url) {
        console.log('Manually redirecting to:', result.url);
        router.push(result.url);
      } else if (!result?.ok) {
        console.error('Sign-in failed:', result?.error);
        setIsRedirecting(false);
      }
    } catch (error) {
      console.error('Error during sign-in:', error);
      setIsRedirecting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Track your workouts and get AI-powered insights
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <button
            onClick={handleSignIn}
            disabled={isRedirecting}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
              </svg>
            </span>
            {isRedirecting ? 'Redirecting...' : 'Sign in with Google'}
          </button>
          
          {/* Debug info */}
          {process.env.NODE_ENV !== 'production' && (
            <div className="mt-4 p-2 border rounded bg-gray-50 text-xs">
              <p>Callback URL: {callbackUrl}</p>
              <p>Status: {isRedirecting ? 'Redirecting' : 'Ready'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 