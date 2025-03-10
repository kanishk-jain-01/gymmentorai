'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { ReactNode, useEffect, useState } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  // This helps prevent hydration mismatch
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Force dark mode to be applied correctly
  useEffect(() => {
    // This is a direct DOM manipulation to ensure the theme is applied
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateTheme = (e: MediaQueryListEvent | MediaQueryList) => {
      const isDark = e.matches;
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    // Initial check
    updateTheme(darkModeMediaQuery);
    
    // Listen for changes
    darkModeMediaQuery.addEventListener('change', updateTheme);
    
    return () => {
      darkModeMediaQuery.removeEventListener('change', updateTheme);
    };
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="gymmentor-theme"
      forcedTheme={null}
    >
      <SessionProvider>
        {mounted ? children : <div style={{ visibility: 'hidden' }}>{children}</div>}
      </SessionProvider>
    </ThemeProvider>
  );
} 