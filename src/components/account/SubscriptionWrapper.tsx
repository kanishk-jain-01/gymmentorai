import React from 'react';
import SubscriptionStatus from '@/components/SubscriptionStatus';
import { SubscriptionStatus as SubscriptionStatusType } from '@/types';

interface SubscriptionWrapperProps {
  onSubscriptionStatusChange: (status: SubscriptionStatusType) => void;
}

const SubscriptionWrapper: React.FC<SubscriptionWrapperProps> = ({ onSubscriptionStatusChange }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-theme-fg mb-4">Subscription</h2>
      <SubscriptionStatus onSubscriptionChange={onSubscriptionStatusChange} />
    </div>
  );
};

export default SubscriptionWrapper; 