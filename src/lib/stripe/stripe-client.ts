import { loadStripe, Stripe as StripeClient } from '@stripe/stripe-js';

// Load the Stripe client once and reuse it
let stripePromise: Promise<StripeClient | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 
                process.env.STRIPE_PUBLISHABLE_KEY;
    
    if (!key) {
      throw new Error('Stripe publishable key is not set');
    }
    
    stripePromise = loadStripe(key);
  }
  
  return stripePromise;
}; 