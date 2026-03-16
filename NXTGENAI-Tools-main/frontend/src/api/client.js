/**
 * API Client for FastAPI Backend
 * Handles all HTTP requests with proper error handling and token management
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Get stored authentication token
 */
export const getToken = () => {
  return localStorage.getItem('access_token');
};

/**
 * Set authentication token
 */
export const setToken = (token) => {
  if (token) {
    localStorage.setItem('access_token', token);
  } else {
    localStorage.removeItem('access_token');
  }
};

/**
 * Remove authentication token
 */
export const removeToken = () => {
  localStorage.removeItem('access_token');
};

/**
 * Set user role
 */
export const setRole = (role) => {
  if (role) {
    localStorage.setItem('user_role', role);
  } else {
    localStorage.removeItem('user_role');
  }
};

/**
 * Get stored user role
 */
export const getRole = () => {
  return localStorage.getItem('user_role');
};

/**
 * Remove user role
 */
export const removeRole = () => {
  localStorage.removeItem('user_role');
};

/**
 * Set user ID
 */
export const setUserId = (userId) => {
  if (userId) {
    localStorage.setItem('user_id', userId);
  } else {
    localStorage.removeItem('user_id');
  }
};

/**
 * Get stored user ID
 */
export const getUserId = () => {
  return localStorage.getItem('user_id');
};

/**
 * Remove user ID
 */
export const removeUserId = () => {
  localStorage.removeItem('user_id');
};

/**
 * Make an API request with automatic token injection
 * @param {string} endpoint - API endpoint (e.g., '/auth/register')
 * @param {object} options - Fetch options (method, body, etc.)
 * @returns {Promise} - Response data or throws error
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add authorization header if token exists (for backward compatibility or fallback)
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
    credentials: 'include', // ✅ Essential for Cookies
  };

  try {
    let response = await fetch(url, config);

    // ✅ Automatic Token Refresh Logic
    if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
      console.log("Access token expired, attempting refresh...");
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setToken(refreshData.access_token);
        // Retry original request
        headers['Authorization'] = `Bearer ${refreshData.access_token}`;
        response = await fetch(url, { ...config, headers });
      } else {
        // Refresh failed, redirect to login
        removeToken();
        window.location.href = '/login';
        throw new Error('Session expired');
      }
    }

    // Parse response body
    let data;
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }
    } catch (parseError) {
      console.error("Failed to parse response:", parseError);
      data = { message: "Failed to parse server response" };
    }

    // Handle error responses
    if (!response.ok) {
      console.error(`❌ API Error ${response.status} on ${endpoint}:`);
      console.error(`   Status: ${response.status} ${response.statusText}`);
      console.error(`   Message: ${data?.detail || data?.message || 'Unknown error'}`);
      console.error(`   Full response:`, data);
      
      const error = {
        status: response.status,
        statusText: response.statusText,
        message: data?.detail || data?.message || 'An error occurred',
        data,
      };
      throw error;
    }

    console.log(`✅ API Success ${response.status} on ${endpoint}`);
    return data;
  } catch (error) {
    // Handle network errors or other exceptions
    if (error.status) {
      // This is an API error (already processed above)
      throw error;
    }
    // Network error or other exception
    throw {
      status: 0,
      statusText: 'Network Error',
      message: 'Unable to connect to the server. Please check your connection.',
      error: error.message,
    };
  }
};

/**
 * GET request
 */
export const get = (endpoint, options = {}) => {
  return apiRequest(endpoint, { ...options, method: 'GET' });
};

/**
 * POST request
 */
export const post = (endpoint, data, options = {}) => {
  return apiRequest(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * PUT request
 */
export const put = (endpoint, data, options = {}) => {
  return apiRequest(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

/**
 * DELETE request
 */
export const del = (endpoint, options = {}) => {
  return apiRequest(endpoint, { ...options, method: 'DELETE' });
};

export default {
  get,
  post,
  put,
  delete: del,
  setToken,
  removeToken,
};

