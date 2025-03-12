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

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme();
  }, [resolvedTheme]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <nav className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                  GymMentorAI
                </Link>
              </div>
              {(session || process.env.NODE_ENV !== 'production') && (
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    href="/dashboard"
                    className={`${
                      pathname === '/dashboard'
                        ? 'border-indigo-500 text-gray-900 dark:text-white'
                        : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-100'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Log Workout
                  </Link>
                  <Link
                    href="/visualization"
                    className={`${
                      pathname === '/visualization'
                        ? 'border-indigo-500 text-gray-900 dark:text-white'
                        : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-100'
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
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-900"
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

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} GymMentorAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
} 