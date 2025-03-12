import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';

export default function TrialSetup() {
  const { data: session, status } = useSession();
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Only attempt to set up trial if authenticated
    if (status === 'authenticated') {
      setupTrial();
    }
  }, [status]);
  
  const setupTrial = async () => {
    try {
      setIsSettingUp(true);
      setError(null);
      
      // Call the API to set up the trial period
      const response = await axios.post('/api/user/setup-trial');
      
      if (response.data.message) {
        setSetupComplete(true);
        console.log('Trial setup response:', response.data);
      }
    } catch (err) {
      console.error('Error setting up trial:', err);
      setError('Failed to set up trial period. Please try again later.');
    } finally {
      setIsSettingUp(false);
    }
  };
  
  // Don't render anything visible to the user
  return null;
} 