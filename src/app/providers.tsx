'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import axios from 'axios';
import OnboardingModal from '@/components/OnboardingModal';
import { UnitPreferencesProvider } from '@/contexts/UnitPreferencesContext';

// Wrapper component that checks for authentication
function AuthenticatedOnboarding({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  
  useEffect(() => {
    // Only check for onboarding if user is authenticated and not on the landing page
    if (status === 'authenticated' && session?.user && pathname !== '/') {
      const checkOnboardingStatus = async () => {
        setIsLoading(true);
        try {
          const response = await axios.get('/api/user/onboarding');
          // If user hasn't seen onboarding, show the modal
          if (!response.data.hasSeenOnboarding) {
            setShowOnboarding(true);
          }
        } catch (error) {
          console.error('Failed to check onboarding status:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      checkOnboardingStatus();
    } else {
      setIsLoading(false);
    }
  }, [status, session, pathname]);
  
  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
  };

  return (
    <>
      {children}
      {!isLoading && showOnboarding && <OnboardingModal onClose={handleCloseOnboarding} />}
    </>
  );
}

export default function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="gymmentor-theme"
    >
      <SessionProvider>
        <UnitPreferencesProvider>
          {mounted ? (
            <AuthenticatedOnboarding>
              {children}
            </AuthenticatedOnboarding>
          ) : (
            <div style={{ visibility: 'hidden' }}>{children}</div>
          )}
        </UnitPreferencesProvider>
      </SessionProvider>
    </ThemeProvider>
  );
} 