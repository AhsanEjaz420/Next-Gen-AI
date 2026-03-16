/**
 * History API Service
 */

import { get } from './client';

/**
 * Fetch generation history for the current user
 * @param {number} limit - Number of records to fetch
 * @returns {Promise<Array>} - List of history entries
 */
export const getHistory = async (limit = 20) => {
  return await get(`/history/?limit=${limit}`);
};

/**
 * Toggle favorite status for a history entry
 * @param {number} id - History entry ID
 * @returns {Promise<object>} - Updated history entry
 */
export const toggleFavorite = async (id) => {
  return await post(`/history/${id}/toggle-favorite`);
};

/**
 * Refine a previous generation with new instructions
 * @param {number} id - History entry ID
 * @param {string} instruction - Refinement instruction
 * @returns {Promise<object>} - New history entry
 */
export const refineHistoryItem = async (id, instruction) => {
  return await post(`/history/${id}/refine`, { instruction });
};

export default {
  getHistory,
  toggleFavorite,
  refineHistoryItem,
};
