import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { isAdmin, isProductManager, isCustomer } from '../features/user';

/**
 * A component that restricts access to routes based on user roles
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string[]} props.allowedRoles - Array of roles allowed to access this route
 * @param {string} props.redirectPath - Path to redirect to if unauthorized (default: '/login')
 */
const RoleBasedRoute = ({ children, allowedRoles, redirectPath = '/login' }) => {
  const { loggedInUser } = useSelector((state) => state.user);

  // If user is not logged in, redirect to login
  if (!loggedInUser) {
    return <Navigate to={redirectPath} replace />;
  }

  // Check if user has one of the allowed roles
  const hasRequiredRole = allowedRoles.includes(loggedInUser.role);

  if (!hasRequiredRole) {
    // User is logged in but doesn't have the required role
    return <Navigate to="/" replace />;
  }

  // User is authorized, render the protected component
  return children;
};

export default RoleBasedRoute;
