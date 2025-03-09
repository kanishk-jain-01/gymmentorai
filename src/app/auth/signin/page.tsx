'use client';

import { signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const [callbackUrl, setCallbackUrl] = useState('/dashboard');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    // Check if we're being redirected from somewhere
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const redirectUrl = urlParams.get('callbackUrl');
      const errorMsg = urlParams.get('error');
      
      if (redirectUrl) {
        console.log('Setting callback URL to:', redirectUrl);
        setCallbackUrl(redirectUrl);
      }
      
      if (errorMsg) {
        setError(decodeURIComponent(errorMsg));
      }
    }
  }, []);

  const handleSignIn = async () => {
    setIsRedirecting(true);
    setError(null);
    
    // Log to both console and localStorage to preserve across redirects
    const logMessage = `Signing in with Google, callback URL: ${callbackUrl}`;
    console.log(logMessage);
    localStorage.setItem('auth_debug_log', JSON.stringify({
      timestamp: new Date().toISOString(),
      message: logMessage
    }));
    
    try {
      const result = await signIn('google', { 
        callbackUrl,
        redirect: false // Change to false to handle redirects manually
      });
      
      // Store result in localStorage to preserve across redirects
      localStorage.setItem('auth_result', JSON.stringify({
        timestamp: new Date().toISOString(),
        result
      }));
      
      console.log('Sign-in result:', result);
      
      if (result?.ok && result?.url) {
        console.log('Manually redirecting to:', result.url);
        router.push(result.url);
      } else if (!result?.ok) {
        const errorMessage = result?.error || 'Sign-in failed';
        console.error('Sign-in failed:', errorMessage);
        setError(errorMessage);
        setIsRedirecting(false);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during sign-in';
      console.error('Error during sign-in:', errorMessage);
      localStorage.setItem('auth_error', JSON.stringify({
        timestamp: new Date().toISOString(),
        error: errorMessage
      }));
      setError(errorMessage);
      setIsRedirecting(false);
    }
  };

  // Load debug logs on component mount
  useEffect(() => {
    try {
      const debugLog = localStorage.getItem('auth_debug_log');
      const authResult = localStorage.getItem('auth_result');
      const authError = localStorage.getItem('auth_error');
      
      if (debugLog) console.log('Previous auth log:', JSON.parse(debugLog));
      if (authResult) console.log('Previous auth result:', JSON.parse(authResult));
      if (authError) console.log('Previous auth error:', JSON.parse(authError));
    } catch (e) {
      console.error('Error loading debug logs:', e);
    }
  }, []);

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
        
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Authentication Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
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
              <p>Error: {error || 'None'}</p>
              <button 
                onClick={() => {
                  localStorage.removeItem('auth_debug_log');
                  localStorage.removeItem('auth_result');
                  localStorage.removeItem('auth_error');
                  alert('Debug logs cleared');
                }}
                className="mt-2 text-xs text-indigo-600 hover:text-indigo-800"
              >
                Clear Debug Logs
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 