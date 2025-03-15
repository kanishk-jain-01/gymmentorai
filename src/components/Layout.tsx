import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn} from 'next-auth/react';
import ThemeToggle from './ThemeToggle';
import ProfileDropdown from './ProfileDropdown';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const loading = status === 'loading';

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
          <div className="flex flex-col items-center">
            <p className="text-center text-sm mb-4">
              &copy; {new Date().getFullYear()} GymMentorAI. All rights reserved.
            </p>
            
            {/* Social Media Icons */}
            <div className="flex space-x-6 mt-2">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-theme-fg hover:text-indigo-500">
                <FaFacebook className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-theme-fg hover:text-indigo-500">
                <FaTwitter className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-theme-fg hover:text-indigo-500">
                <FaInstagram className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-theme-fg hover:text-indigo-500">
                <FaLinkedin className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 