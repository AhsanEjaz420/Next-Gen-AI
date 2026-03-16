import { get } from './client';

/**
 * Fetch all users with plan and credit info (admin-only endpoint).
 * 
 * Endpoint: GET /admin/users
 * Returns: Array of users with subscription details
 */
export const getAllUsersWithPlans = async () => {
  console.log('📤 Fetching users from /admin/users endpoint');
  return get('/admin/users');
};

export default {
  getAllUsersWithPlans,
};
