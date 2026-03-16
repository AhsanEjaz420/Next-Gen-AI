/**
 * User Insights API Service
 */

import { get } from './client';

/**
 * Fetch the user's generation statistics
 * @returns {Promise<object>} - Insights data
 */
export const getInsights = async () => {
  return await get('/insights/');
};

export default {
  getInsights,
};
