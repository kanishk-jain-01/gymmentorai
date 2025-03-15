'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { ReactNode, useEffect, useState } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  
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
        {mounted ? children : <div style={{ visibility: 'hidden' }}>{children}</div>}
      </SessionProvider>
    </ThemeProvider>
  );
} 