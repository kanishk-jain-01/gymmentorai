'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

interface OnboardingModalProps {
  onClose: () => void;
}

export default function OnboardingModal({ onClose }: OnboardingModalProps) {
  const { data: session } = useSession();
  const [subscribedToEmails, setSubscribedToEmails] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!session?.user?.email) {
      setError("You must be signed in to update preferences");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Update email preferences
      await axios.post('/api/user/email-preferences', {
        subscribedToEmails
      });
      
      // Mark onboarding as seen
      await axios.post('/api/user/onboarding');
      
      onClose();
    } catch (error) {
      console.error('Failed to update preferences:', error);
      setError("Failed to save preferences. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-theme-card rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Welcome to GymMentorAI</h2>
          <p className="text-theme-fg-muted">
            We intend to be the easiest tool for tracking your workout data. 
            Press "Get Started" to start your 7 day free trial, no credit card required.
          </p>
        </div>

        <div className="mb-6">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={subscribedToEmails}
              onChange={(e) => setSubscribedToEmails(e.target.checked)}
              className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <span>
              Keep me updated with promotional emails and new features
            </span>
          </label>
        </div>

        {error && (
          <div className="mb-4 text-red-500 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Get Started'}
          </button>
        </div>
      </div>
    </div>
  );
} 