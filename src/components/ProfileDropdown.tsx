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
        className="flex rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-indigo-800 font-medium text-sm">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
        )}
      </button>
      
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-theme-card ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          <div className="px-4 py-3 border-b border-theme-border">
            <p className="text-sm font-medium text-theme-fg truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-theme-fg opacity-70 truncate">
              {user?.email || ''}
            </p>
          </div>
          
          <Link
            href="/account"
            className="block px-4 py-2 text-sm text-theme-fg hover:bg-theme-bg"
            onClick={() => setIsOpen(false)}
          >
            Account Settings
          </Link>
          
          <button
            onClick={handleSignOut}
            className="block w-full text-left px-4 py-2 text-sm text-theme-fg hover:bg-theme-bg"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
} 