import { Navigate, useLocation } from 'react-router-dom';
import { getToken, getRole } from '../api/client';

/**
 * ProtectedRoute Component
 * Protects routes that require authentication
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = getToken();

  // If no token, redirect to login with return path
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render the protected component
  return children;
};

/**
 * AdminProtectedRoute Component
 * Protects admin routes that require both authentication and admin role
 * Redirects to login if not authenticated, to dashboard if not admin
 */
export const AdminProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = getToken();
  const role = getRole();

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If no admin role, redirect to dashboard
  if (role !== 'admin') {
    console.warn('Access Denied: User is not an admin');
    return <Navigate to="/dashboard" replace />;
  }

  // User is authenticated and is admin, render the component
  return children;
};

export default ProtectedRoute;

