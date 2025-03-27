import React from 'react';

interface NotificationBannerProps {
  success: boolean;
  canceled: boolean;
  successMessage: string | null;
}

const NotificationBanner = ({ 
  success, 
  canceled,
  successMessage
}: NotificationBannerProps) => {
  return (
    <>
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Subscription successful
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  Thank you for subscribing to GymMentor! Your subscription is now active.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {canceled && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Subscription canceled
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  You canceled the subscription process. If you have any questions or need help, please contact us at us at support@gymmentorai.com!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg animate-fadeIn">
          <p>{successMessage}</p>
        </div>
      )}
    </>
  );
};

export default NotificationBanner; 