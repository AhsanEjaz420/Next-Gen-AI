/**
 * Authentication Debugging Utility
 * Use this to debug token and session issues
 * 
 * Usage in browser console:
 * import { runDebugScript } from './utils/debugAuth'
 * runDebugScript()
 */

/**
 * Decode JWT token to see its payload
 */
export const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) throw new Error('Invalid token format');
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('❌ JWT Decode Error:', error.message);
    return null;
  }
};

/**
 * Check token expiration
 */
export const isTokenExpired = (token) => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;
  return Date.now() > decoded.exp * 1000;
};

/**
 * Format token for display
 */
export const formatToken = (token) => {
  if (!token) return 'No token';
  if (token.length < 100) return token;
  return token.substring(0, 50) + '...[' + token.length + ' chars]';
};

/**
 * Complete authentication debug script
 */
export const runDebugScript = async () => {
  console.clear();
  console.log('%c🔧 NXTGENAI Frontend Authentication Debug', 'font-size: 16px; font-weight: bold; color: #6366f1;');
  console.log('%c' + '='.repeat(60), 'color: #6366f1;');

  // 1. Check Token in Storage
  console.log('\n%c1️⃣ TOKEN STORAGE CHECK', 'font-weight: bold; color: #8b5cf6;');
  const token = localStorage.getItem('access_token');
  console.log('  Token exists?', token !== null);
  console.log('  Token length:', token?.length);
  console.log('  Token preview:', formatToken(token));

  // 2. Check Role in Storage
  console.log('\n%c2️⃣ ROLE STORAGE CHECK', 'font-weight: bold; color: #8b5cf6;');
  const role = localStorage.getItem('user_role');
  console.log('  Role stored?', role !== null);
  console.log('  Role value:', role || 'Not stored');
  console.log('  Is Admin?', role === 'admin');

  // 3. Decode JWT
  if (token) {
    console.log('\n%c3️⃣ JWT PAYLOAD DECODE', 'font-weight: bold; color: #8b5cf6;');
    const decoded = decodeJWT(token);
    if (decoded) {
      console.log('  User ID (sub):', decoded.sub);
      console.log('  Session ID:', decoded.session_id);
      console.log('  Expires at:', new Date(decoded.exp * 1000));
      console.log('  Is expired?', isTokenExpired(token) ? '❌ YES' : '✅ NO');
    }
  }

  // 4. Test Admin API Call
  console.log('\n%c4️⃣ ADMIN API TEST (/admin/users)', 'font-weight: bold; color: #8b5cf6;');
  if (!token) {
    console.log('  ❌ No token found! Cannot test API');
  } else if (role !== 'admin') {
    console.log('  ⚠️ User is not admin (role:', role, ')');
  } else {
    try {
      const response = await fetch('http://localhost:8000/admin/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('  Status Code:', response.status);
      console.log('  Status Text:', response.statusText);
      console.log('  Response OK?', response.ok ? '✅ YES' : '❌ NO');

      const data = await response.json();
      if (response.ok) {
        console.log('  ✅ SUCCESS! Users count:', Array.isArray(data) ? data.length : 'Unknown');
        console.log('  Sample user:', data[0]);
      } else {
        console.log('  ❌ ERROR:', data);
      }
    } catch (err) {
      console.log('  ❌ API Error:', err.message);
    }
  }

  // 5. Test Auth/Me Endpoint
  console.log('\n%c5️⃣ AUTH/ME ENDPOINT TEST', 'font-weight: bold; color: #8b5cf6;');
  if (!token) {
    console.log('  ❌ No token found! Cannot test API');
  } else {
    try {
      const response = await fetch('http://localhost:8000/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('  Status Code:', response.status);
      const data = await response.json();
      if (response.ok) {
        console.log('  ✅ SUCCESS!');
        console.log('  User:', data);
      } else {
        console.log('  ❌ ERROR:', data);
      }
    } catch (err) {
      console.log('  ❌ API Error:', err.message);
    }
  }

  // Summary
  console.log('\n%c' + '='.repeat(60), 'color: #6366f1;');
  console.log('%c✅ DEBUG COMPLETE', 'font-size: 14px; font-weight: bold; color: #10b981;');

  // Health Check
  console.log('\n%c📋 HEALTH CHECK SUMMARY', 'font-weight: bold; color: #f59e0b;');
  const checks = {
    'Token exists': token !== null,
    'Token not expired': token ? !isTokenExpired(token) : false,
    'Role stored': role !== null,
    'Is Admin': role === 'admin',
    'Token format valid': token ? token.split('.').length === 3 : false,
  };

  Object.entries(checks).forEach(([check, passed]) => {
    console.log(`  ${passed ? '✅' : '❌'} ${check}`);
  });

  const allPassed = Object.values(checks).every((v) => v);
  console.log(
    '\n%c' + (allPassed ? '🎉 ALL CHECKS PASSED!' : '⚠️ SOME CHECKS FAILED'),
    allPassed ? 'color: #10b981; font-weight: bold; font-size: 14px;' : 'color: #ef4444; font-weight: bold; font-size: 14px;'
  );
};

/**
 * Quick token check
 */
export const checkToken = () => {
  const token = localStorage.getItem('access_token');
  const role = localStorage.getItem('user_role');

  console.log('%c🔐 QUICK TOKEN CHECK', 'font-weight: bold; color: #6366f1;');
  console.log('Token:', token ? '✅ Present' : '❌ Missing');
  console.log('Role:', role ? `✅ ${role}` : '❌ Missing');
  console.log('Admin?', role === 'admin' ? '✅ YES' : '❌ NO');

  if (token) {
    console.log('Expired?', isTokenExpired(token) ? '❌ YES' : '✅ NO');
  }
};

/**
 * Clear auth and logout
 */
export const clearAuth = () => {
  console.log('%c🗑️ CLEARING AUTHENTICATION', 'font-weight: bold; color: #ef4444;');
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_role');
  localStorage.removeItem('user');
  console.log('✅ Auth cleared. Please refresh page and login again.');
};

export default {
  decodeJWT,
  isTokenExpired,
  formatToken,
  runDebugScript,
  checkToken,
  clearAuth,
};
