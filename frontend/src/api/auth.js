/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */

import { post, get, setToken, setRole } from './client';

const AUTH_ENDPOINTS = {
  register: '/auth/register',
  login: '/auth/login',
  me: '/auth/me',
  logout: '/auth/logout',
  sessions: '/auth/sessions',
};

/**
 * Register a new user
 * @param {object} userData - { username, email, password }
 * @returns {Promise<object>} - User data
 */
export const registerUser = async (userData) => {
  try {
    const response = await post(AUTH_ENDPOINTS.register, {
      username: userData.username,
      email: userData.email,
      password: userData.password,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Login user
 * @param {object} credentials - { email, password }
 * @returns {Promise<object>} - { access_token, token_type }
 */
export const loginUser = async (credentials) => {
  try {
    // FastAPI OAuth2PasswordRequestForm expects form data
    const formData = new URLSearchParams();
    formData.append('username', credentials.email); // OAuth2 uses 'username' field for email
    formData.append('password', credentials.password);

    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${AUTH_ENDPOINTS.login}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
      credentials: 'include', // ✅ Required for HttpOnly Cookies
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { detail: await response.text() || 'Login failed' };
      }
      
      throw {
        status: response.status,
        statusText: response.statusText,
        message: errorData.detail || 'Login failed',
        data: errorData,
      };
    }

    const data = await response.json();
    
    // Store token
    if (data.access_token) {
      setToken(data.access_token);
    }

    // Store role if present in response
    if (data.role) {
      setRole(data.role);
    }

    return data;
  } catch (error) {
    if (error.status) {
      throw error;
    }
    throw {
      status: 0,
      statusText: 'Network Error',
      message: 'Unable to connect to the server. Please check your connection.',
      error: error.message,
    };
  }
};

/**
 * Get current user info
 * @returns {Promise<object>} - User data
 */
export const getCurrentUser = async () => {
  try {
    const response = await get(AUTH_ENDPOINTS.me);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Logout user
 * @returns {Promise<object>} - Logout confirmation
 */
export const logoutUser = async () => {
  try {
    const response = await post(AUTH_ENDPOINTS.logout, {});
    return response;
  } catch (error) {
    throw error;
  }
};

export default {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
};

