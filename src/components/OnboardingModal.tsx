'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { useUnitPreferences } from '@/contexts/UnitPreferencesContext';
import { OnboardingModalProps } from '@/types';

export default function OnboardingModal({ onClose }: OnboardingModalProps) {
  const { data: session } = useSession();
  const { updatePreferences } = useUnitPreferences();
  const [subscribedToEmails, setSubscribedToEmails] = useState(true);
  const [weightUnit, setWeightUnit] = useState<'lb' | 'kg'>('lb');
  const [distanceUnit, setDistanceUnit] = useState<'mi' | 'km' | 'm'>('mi');
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
      
      // Update unit preferences
      await updatePreferences({
        weightUnit,
        distanceUnit
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
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-theme-card rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 border border-subtle">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3 text-gradient-primary">Welcome</h2>
          <p className="text-theme-fg opacity-80">
            Let's set up your GymMentorAI preferences
          </p>
        </div>

        <div className="space-y-8 mb-8">
          <div>
            <h3 className="font-medium mb-4 text-primary text-lg">Unit Preferences</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-theme-fg mb-2">Weight Units</label>
                <div className="flex items-center space-x-6">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-primary"
                      value="lb"
                      checked={weightUnit === 'lb'}
                      onChange={() => setWeightUnit('lb')}
                      name="weightUnit"
                    />
                    <span className="ml-2">Pounds (lb)</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-primary"
                      value="kg"
                      checked={weightUnit === 'kg'}
                      onChange={() => setWeightUnit('kg')}
                      name="weightUnit"
                    />
                    <span className="ml-2">Kilograms (kg)</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-theme-fg mb-2">Distance Units</label>
                <div className="grid grid-cols-3 gap-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-primary"
                      value="mi"
                      checked={distanceUnit === 'mi'}
                      onChange={() => setDistanceUnit('mi')}
                      name="distanceUnit"
                    />
                    <span className="ml-2">Miles</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-primary"
                      value="km"
                      checked={distanceUnit === 'km'}
                      onChange={() => setDistanceUnit('km')}
                      name="distanceUnit"
                    />
                    <span className="ml-2">Kilometers</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-primary"
                      value="m"
                      checked={distanceUnit === 'm'}
                      onChange={() => setDistanceUnit('m')}
                      name="distanceUnit"
                    />
                    <span className="ml-2">Meters</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-4 text-primary text-lg">Email Updates</h3>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={subscribedToEmails}
                onChange={(e) => setSubscribedToEmails(e.target.checked)}
                className="form-checkbox h-5 w-5 text-primary rounded focus:ring-indigo-500"
              />
              <span>
                Keep me updated with new features
              </span>
            </label>
          </div>
        </div>

        {error && (
          <div className="mb-6 text-error text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-3 bg-gradient-primary text-white text-base font-medium rounded-full shadow-sm hover:bg-gradient-primary-hover focus:outline-none disabled:opacity-50 w-full max-w-xs"
          >
            {isSubmitting ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
} 