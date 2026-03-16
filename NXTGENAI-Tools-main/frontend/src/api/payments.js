/**
 * Payment API Service
 * Handles all payment-related API calls to FastAPI backend
 */

import { get, post } from './client.js';

/**
 * Create checkout session for Stripe payment
 * @param {string} plan - Plan type (e.g., 'premium')
 * @param {string} successUrl - URL to redirect after successful payment
 * @param {string} cancelUrl - URL to redirect if payment is cancelled
 * @returns {Promise<Object>} Checkout session with URL and session_id
 */
export const createCheckoutSession = async (plan, successUrl, cancelUrl) => {
  try {
    // Backend expects query parameters, not body
    const params = new URLSearchParams({
      plan: plan,
      success_url: successUrl,
      cancel_url: cancelUrl
    });
    
    const response = await post(`/payment/create-checkout-session?${params.toString()}`);
    return response;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

/**
 * Create a payment intent (legacy - use createCheckoutSession instead)
 * @param {number} amount - Amount in cents (e.g., 1000 = $10.00)
 * @param {string} currency - Currency code (e.g., 'usd')
 * @param {string} plan - Plan type (e.g., 'free', 'medium', 'premium')
 * @returns {Promise<Object>} Payment intent with client_secret
 */
export const createPaymentIntent = async (amount, currency = 'usd', plan = 'premium') => {
  try {
    const response = await post('/payment/create-intent', { 
      amount, 
      currency,
      plan
    });
    return response;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

/**
 * Verify payment after Stripe redirect
 * @param {string} sessionId - Stripe session ID from redirect URL
 * @returns {Promise<Object>} Payment verification result
 */
export const verifyPayment = async (sessionId) => {
  try {
    const response = await get(`/payment/verify-payment/${sessionId}`);
    return response;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

/**
 * Confirm payment completion
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @returns {Promise<Object>} Payment confirmation details
 */
export const confirmPayment = async (paymentIntentId) => {
  try {
    const response = await post('/payments/confirm', { 
      payment_intent_id: paymentIntentId 
    });
    return response;
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};

/**
 * Get payment history for current user
 * @returns {Promise<Array>} List of payment records 
 */
export const getPaymentHistory = async () => {
  try {
    const response = await get('/payments/history');
    return response;
  } catch (error) {
    console.error('Error fetching payment history:', error);
    throw error;
  }
};

/**
 * Process payment with payment method
 * @param {string} paymentMethodId - Stripe payment method ID
 * @param {number} amount - Amount in cents
 * @returns {Promise<Object>} Payment result
 */
export const processPayment = async (paymentMethodId, amount) => {
  try {
    const response = await post('/payments/process', {
      payment_method_id: paymentMethodId,
      amount,
    });
    return response;
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
};

/**
 * Get available plans with user's current subscription
 * @returns {Promise<Array>} List of plans with is_current flag
 */
export const getPlans = async () => {
  try {
    const response = await get('/payment/plans');
    return response;
  } catch (error) {
    console.error('Error fetching plans:', error);
    throw error;
  }
};
