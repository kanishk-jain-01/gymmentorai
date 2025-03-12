import React, { useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ProfileDropdownProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function ProfileDropdown({ user }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="flex rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="sr-only">Open user menu</span>
        {user?.image ? (
          <img
            className="h-8 w-8 rounded-full"
            src={user.image}
            alt={user.name || 'User'}
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
            <span className="text-indigo-800 dark:text-indigo-200 font-medium text-sm">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
        )}
      </button>
      
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email || ''}
            </p>
          </div>
          
          <Link
            href="/account"
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            Account Settings
          </Link>
          
          <button
            onClick={handleSignOut}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
} 