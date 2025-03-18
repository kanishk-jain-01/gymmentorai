import React from 'react';

interface EmailPreferencesSectionProps {
  subscribedToEmails: boolean;
  emailPrefLoading: boolean;
  onEmailPreferenceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const EmailPreferencesSection: React.FC<EmailPreferencesSectionProps> = ({
  subscribedToEmails,
  emailPrefLoading,
  onEmailPreferenceChange
}) => {
  return (
    <div className="bg-theme-card shadow rounded-lg p-6">
      <h2 className="text-lg font-medium mb-4">Email Preferences</h2>
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-theme-fg">Promotional emails</p>
          <p className="text-sm text-theme-fg-muted">
            Receive updates about new features and promotions
          </p>
        </div>
        <div className="flex items-center">
          {emailPrefLoading ? (
            <div className="animate-pulse h-5 w-10 bg-theme-hover rounded"></div>
          ) : (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={subscribedToEmails}
                onChange={onEmailPreferenceChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailPreferencesSection; 