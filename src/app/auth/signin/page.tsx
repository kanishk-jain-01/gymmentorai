'use client';

import { signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function SignIn() {
  const [callbackUrl, setCallbackUrl] = useState('/log');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if we're being redirected from somewhere
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const redirectUrl = urlParams.get('callbackUrl');
      const errorMsg = urlParams.get('error');
      
      if (redirectUrl) {
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
    
    try {
      const result = await signIn('google', { 
        callbackUrl,
        redirect: true // Change to true to let NextAuth handle redirects
      });
      
      // This code will only run if redirect is set to false
      if (result?.error) {
        setError(result.error);
        setIsRedirecting(false);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during sign-in';
      setError(errorMessage);
      setIsRedirecting(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden flex items-center justify-center bg-theme-bg">
      <div className="fixed inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-primary opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
      </div>
      
      <div className="max-w-md w-full space-y-10 p-8 bg-theme-card bg-opacity-80 backdrop-blur-sm rounded-2xl shadow-xl border border-subtle mx-4">
        <div>
          <h2 className="text-center text-3xl font-bold text-gradient-primary">
            Sign-In to Access Your AI Workout Notebook
          </h2>
        </div>
        
        {error && (
          <div className="text-error text-sm text-center">
            <p>{error}</p>
          </div>
        )}
        
        <div className="flex justify-center">
          <button
            onClick={handleSignIn}
            disabled={isRedirecting}
            className="w-full max-w-xs flex justify-center items-center py-3 px-8 text-base font-medium rounded-full text-white bg-gradient-primary hover:bg-gradient-primary-hover focus:outline-none shadow-sm disabled:opacity-70"
          >
            <span className="mr-3">
              <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
              </svg>
            </span>
            {isRedirecting ? 'Redirecting...' : 'Sign in with Google'}
          </button>
        </div>
      </div>
      
      <div className="fixed inset-x-0 bottom-0 -z-10 transform-gpu overflow-hidden blur-3xl">
        <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-primary opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"></div>
      </div>
    </div>
  );
} 