/**
 * User Profile API Service
 */

import { get, put } from './client';

/**
 * Fetch the user's brand profile
 * @returns {Promise<object>} - Profile data
 */
export const getProfile = async () => {
  return await get('/profile/');
};

/**
 * Update the user's brand profile
 * @param {object} data - Profile update data
 * @returns {Promise<object>} - Updated profile data
 */
export const updateProfile = async (data) => {
  return await put('/profile/', data);
};

export default {
  getProfile,
  updateProfile,
};
