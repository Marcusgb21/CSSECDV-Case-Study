import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Higher-order component that checks if the user is authorized to access a component
 * @param {React.ComponentType} Component - The component to render if authorized
 * @param {Object} options - Authorization options
 * @param {string[]} options.requiredRoles - Roles that are allowed to access the component
 * @param {string[]} options.requiredPermissions - Permissions required to access the component
 * @param {string} options.redirectPath - Path to redirect to if unauthorized
 * @returns {React.ComponentType} - The wrapped component
 */
const withAuthorization = (
  Component,
  { requiredRoles = [], requiredPermissions = [], redirectPath = '/login' } = {}
) => {
  const WithAuthorizationComponent = (props) => {
    const { isAuthenticated, hasRole, hasPermission, loading } = useAuth();

    // Show loading state if still checking authentication
    if (loading) {
      return <div>Loading...</div>;
    }

    // Check if user is authenticated
    if (!isAuthenticated()) {
      return <Navigate to={redirectPath} replace />;
    }

    // Check if user has required roles
    if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
      return <Navigate to="/" replace />;
    }

    // Check if user has required permissions
    if (requiredPermissions.length > 0) {
      const hasAllPermissions = requiredPermissions.every(permission => 
        hasPermission(permission)
      );
      
      if (!hasAllPermissions) {
        return <Navigate to="/" replace />;
      }
    }

    // User is authorized, render the component
    return <Component {...props} />;
  };

  return WithAuthorizationComponent;
};

export default withAuthorization;
