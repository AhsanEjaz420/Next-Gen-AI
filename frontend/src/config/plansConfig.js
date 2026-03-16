/**
 * Subscription Plans Configuration
 * Defines all available plans with their credits and pricing
 */

export const PLANS = {                   
  free: {
    id: 'free',
    name: 'Free',
    credits: 10,
    price: 0,
    priceId: null,
    features: [
      '10 AI Credits',
      'Access to all tools',
      'Basic support',
      'Standard processing speed'
    ],
    color: 'gray',
    popular: false
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    credits: 1000,
    price: 9.99, // $9.99
    priceId: 'price_premium_xxx', // Replace with actual Stripe Price ID
    features: [
      '1000 AI Credits',
      'Access to all tools',
      'Unlimited usage',
      '24/7 Priority support',
      'Fastest processing',
      'Credit rollover',
      'Early access to new features'
    ],
    color: 'purple',
    popular: true
  }
};

/**
 * Get plan by ID
 * @param {string} planId - Plan identifier (free, medium, premium)
 * @returns {object} Plan configuration
 */
export const getPlanById = (planId) => {
  return PLANS[planId] || PLANS.free;
};

/**
 * Get all plans as array
 * @returns {array} Array of plan objects
 */
export const getAllPlans = () => {
  return Object.values(PLANS);
};

/**
 * Check if plan is paid
 * @param {string} planId - Plan identifier
 * @returns {boolean} True if plan requires payment
 */
export const isPaidPlan = (planId) => {
  return planId !== 'free';
};

export default PLANS;
