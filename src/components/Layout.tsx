import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import ThemeToggle from './ThemeToggle';
import { useTheme } from 'next-themes';
import { applyTheme } from '@/lib/theme-script';
import ProfileDropdown from './ProfileDropdown';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const { resolvedTheme } = useTheme();

  // Apply theme only on initial mount, not on theme changes
  useEffect(() => {
    // We don't need to call applyTheme here as next-themes handles this
    // The ThemeProvider in providers.tsx already manages theme persistence
  }, []);

  return (
    <div className="min-h-screen transition-colors duration-200">
      <nav className="bg-theme-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-xl font-bold text-indigo-600">
                  GymMentorAI
                </Link>
              </div>
              {(session || process.env.NODE_ENV !== 'production') && (
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    href="/dashboard"
                    className={`${
                      pathname === '/dashboard'
                        ? 'border-indigo-500'
                        : 'border-transparent hover:border-theme-border hover:text-theme-fg'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Log Workout
                  </Link>
                  <Link
                    href="/visualization"
                    className={`${
                      pathname === '/visualization'
                        ? 'border-indigo-500'
                        : 'border-transparent hover:border-theme-border hover:text-theme-fg'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Visualize
                  </Link>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              
              {!loading && !session && (
                <button
                  onClick={() => signIn()}
                  className="inline-flex items-center px-4 py-2 border border-theme-border text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-border"
                >
                  Sign in
                </button>
              )}
              {session && session.user && (
                <ProfileDropdown user={session.user} />
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      <footer className="border-t py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm">
            &copy; {new Date().getFullYear()} GymMentorAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
} 