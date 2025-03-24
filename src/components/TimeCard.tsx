import React from 'react';
import Link from 'next/link';

interface TimeCardProps {
  title: string;
  count: number;
  href: string;
}

export default function TimeCard({ title, count, href }: TimeCardProps) {
  return (
    <Link href={href} className="block">
      <div className="bg-theme-card shadow overflow-hidden sm:rounded-lg border border-theme-border hover:border-indigo-500 transition-colors">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-theme-fg">{title}</h3>
          <div className="mt-2 flex items-center text-sm text-theme-fg opacity-70">
            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-theme-fg opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            {count} {count === 1 ? 'workout' : 'workouts'}
          </div>
        </div>
      </div>
    </Link>
  );
} 