/**
 * User API Service
 * Handles user profile, credits, and subscription management
 */

import { get, post } from './client.js';

/**
 * Get current user profile with credits and plan info
 * @returns {Promise<Object>} User profile data
 */
export const getUserProfile = async () => {
  try {
    const response = await get('/users/me');
    return response;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Get user's current credits balance
 * @returns {Promise<Object>} { credits: number, plan: string }
 */
export const getUserCredits = async () => {
  try {
    const response = await get('/users/credits');
    return response;
  } catch (error) {
    console.error('Error fetching user credits:', error);
    throw error;
  }
};

/**
 * Deduct credits when user uses a tool
 * @param {number} amount - Number of credits to deduct (default: 1)
 * @param {string} toolName - Name of the tool used
 * @returns {Promise<Object>} Updated credits balance
 */
export const deductCredits = async (amount = 1, toolName = '') => {
  try {
    const response = await post('/users/credits/deduct', {
      amount,
      tool_name: toolName
    });
    return response;
  } catch (error) {
    console.error('Error deducting credits:', error);
    throw error;
  }
};

/**
 * Upgrade user to a paid plan
 * @param {string} planId - Plan to upgrade to (medium, premium)
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @returns {Promise<Object>} Updated user data with new plan and credits
 */
export const upgradePlan = async (planId, paymentIntentId) => {
  try {
    const response = await post('/users/upgrade', {
      plan_id: planId,
      payment_intent_id: paymentIntentId
    });
    return response;
  } catch (error) {
    console.error('Error upgrading plan:', error);
    throw error;
  }
};

/**
 * Get user's usage history
 * @returns {Promise<Array>} List of credit usage records
 */
export const getUsageHistory = async () => {
  try {
    const response = await get('/users/usage-history');
    return response;
  } catch (error) {
    console.error('Error fetching usage history:', error);
    throw error;
  }
};

export default {
  getUserProfile,
  getUserCredits,
  deductCredits,
  upgradePlan,
  getUsageHistory
};
