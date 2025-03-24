'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

type UnitPreferences = {
  weightUnit: 'lb' | 'kg';
  distanceUnit: 'mi' | 'km' | 'm';
};

type UnitPreferencesContextType = {
  preferences: UnitPreferences;
  isLoading: boolean;
  updatePreferences: (newPreferences: Partial<UnitPreferences>) => Promise<void>;
};

const defaultPreferences: UnitPreferences = {
  weightUnit: 'lb',
  distanceUnit: 'm',
};

const UnitPreferencesContext = createContext<UnitPreferencesContextType>({
  preferences: defaultPreferences,
  isLoading: true,
  updatePreferences: async () => {},
});

export const useUnitPreferences = () => useContext(UnitPreferencesContext);

export const UnitPreferencesProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();
  const [preferences, setPreferences] = useState<UnitPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      fetchPreferences();
    } else if (status === 'unauthenticated') {
      // If user is not authenticated, reset to defaults and stop loading
      setPreferences(defaultPreferences);
      setIsLoading(false);
    }
  }, [session, status]);

  const fetchPreferences = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/user/unit-preferences');
      setPreferences({
        weightUnit: response.data.weightUnit || defaultPreferences.weightUnit,
        distanceUnit: response.data.distanceUnit || defaultPreferences.distanceUnit,
      });
    } catch (error) {
      console.error('Failed to fetch unit preferences:', error);
      // If there's an error, use default values
      setPreferences(defaultPreferences);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: Partial<UnitPreferences>) => {
    try {
      setIsLoading(true);
      await axios.post('/api/user/unit-preferences', newPreferences);
      
      // Update local state with new preferences
      setPreferences(prev => ({
        ...prev,
        ...newPreferences,
      }));
    } catch (error) {
      console.error('Failed to update unit preferences:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UnitPreferencesContext.Provider value={{ preferences, isLoading, updatePreferences }}>
      {children}
    </UnitPreferencesContext.Provider>
  );
}; 