import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn} from 'next-auth/react';
import ThemeToggle from './ThemeToggle';
import ProfileDropdown from './ProfileDropdown';
import { FaFacebook, FaTwitter, FaInstagram, FaDumbbell, FaTiktok } from 'react-icons/fa';
import { useState } from 'react';
import { ExtendedSession } from '@/types';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const { data: session, status } = useSession() as { data: ExtendedSession | null, status: string };
  const loading = status === 'loading';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen transition-colors duration-200">
      <nav className="bg-theme-card shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="group flex items-center">
                  <FaDumbbell className="h-6 w-6 mr-2 text-indigo-600 group-hover:text-indigo-500 transition-transform duration-300 ease-in-out group-hover:rotate-12" />
                  <span className="text-xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm hover:drop-shadow-md transition-all duration-300 ease-in-out">
                    GymMentorAI
                  </span>
                </Link>
              </div>
              {(session || process.env.NODE_ENV !== 'production') && (
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    href="/log"
                    className={`${
                      pathname === '/log'
                        ? 'border-indigo-500'
                        : 'border-transparent hover:border-theme-border hover:text-theme-fg'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Workout Log
                  </Link>
                  <Link
                    href="/visualization"
                    className={`${
                      pathname === '/visualization'
                        ? 'border-indigo-500'
                        : 'border-transparent hover:border-theme-border hover:text-theme-fg'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Visualization
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
              
              {/* Mobile menu button */}
              {(session || process.env.NODE_ENV !== 'production') && (
                <div className="sm:hidden">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center p-2 rounded-md text-theme-fg hover:text-indigo-500 hover:bg-theme-hover focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                    aria-expanded="false"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    <span className="sr-only">Open main menu</span>
                    {/* Hamburger icon */}
                    <svg
                      className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                    {/* X icon */}
                    <svg
                      className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state */}
        {mobileMenuOpen && (session || process.env.NODE_ENV !== 'production') && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <Link
                href="/log"
                className={`${
                  pathname === '/log'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                    : 'border-transparent text-theme-fg hover:bg-theme-hover hover:border-theme-border'
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Workout Log
              </Link>
              <Link
                href="/visualization"
                className={`${
                  pathname === '/visualization'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                    : 'border-transparent text-theme-fg hover:bg-theme-hover hover:border-theme-border'
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Visualization
              </Link>
            </div>
          </div>
        )}
      </nav>

      <div className="flex flex-col min-h-[calc(100vh-4rem)]">
        <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>

        <footer className="border-t py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center">
              <p className="text-center text-sm mb-4">
                &copy; {new Date().getFullYear()} GymMentorAI. All rights reserved.
              </p>
              
              {/* Social Media Icons */}
              <div className="flex space-x-6 mt-2">
              <a href="https://www.tiktok.com/@gymmentorai" target="_blank" rel="noopener noreferrer" className="text-theme-fg hover:text-indigo-500">
                  <FaTiktok className="h-5 w-5" aria-hidden="true" />
                  <span className="sr-only">TikTok</span>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-theme-fg hover:text-indigo-500">
                  <FaFacebook className="h-5 w-5" aria-hidden="true" />
                  <span className="sr-only">Facebook</span>
                </a>
                <a href="https://twitter.com/gymmentorai" target="_blank" rel="noopener noreferrer" className="text-theme-fg hover:text-indigo-500">
                  <FaTwitter className="h-5 w-5" aria-hidden="true" />
                  <span className="sr-only">Twitter</span>
                </a>
                <a href="https://instagram.com/gymmentorai" target="_blank" rel="noopener noreferrer" className="text-theme-fg hover:text-indigo-500">
                  <FaInstagram className="h-5 w-5" aria-hidden="true" />
                  <span className="sr-only">Instagram</span>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Layout; 