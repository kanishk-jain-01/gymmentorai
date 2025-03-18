import React from 'react';
import { Session } from 'next-auth';

interface UserInfoSectionProps {
  session: Session | null;
}

const UserInfoSection: React.FC<UserInfoSectionProps> = ({ session }) => {
  if (!session) return null;
  
  return (
    <div>
      <h2 className="text-xl font-semibold text-theme-fg mb-4">User Information</h2>
      <div className="bg-theme-card shadow sm:rounded-lg border border-theme-border">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {session.user?.image ? (
                <img className="h-12 w-12 rounded-full" src={session.user.image} alt={session.user.name || 'User'} />
              ) : (
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-indigo-800 text-lg font-medium">
                    {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || '?'}
                  </span>
                </div>
              )}
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-theme-fg">
                {session.user?.name || 'User'}
              </h3>
              <p className="text-sm text-theme-fg opacity-70">
                {session.user?.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfoSection; 