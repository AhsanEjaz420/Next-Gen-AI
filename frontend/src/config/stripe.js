/**
 * Stripe Configuration
 * Loads publishable key from environment variables
 */

import { loadStripe } from '@stripe/stripe-js';

// Get Stripe publishable key from environment
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn('VITE_STRIPE_PUBLISHABLE_KEY not found in .env file');
}

// Initialize Stripe
export const stripePromise = loadStripe(stripePublishableKey);

export default stripePromise;
