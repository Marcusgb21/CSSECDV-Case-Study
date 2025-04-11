import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AccessDenied from './AccessDenied';

/**
 * Component that checks if the user is authorized to access its children
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string[]} props.requiredRoles - Roles that are allowed to access the children
 * @param {string[]} props.requiredPermissions - Permissions required to access the children
 * @param {string} props.redirectPath - Path to redirect to if unauthorized
 * @param {React.ReactNode} props.fallback - Component to render if unauthorized (instead of redirecting)
 */
const AuthGuard = ({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  redirectPath = '/login',
  fallback = null
}) => {
  const { isAuthenticated, hasRole, hasPermission, loading } = useAuth();
  const [accessDenied, setAccessDenied] = useState(false);
  const [accessDeniedReason, setAccessDeniedReason] = useState('');
  const [securityError, setSecurityError] = useState(false);

  // Log access attempts for security monitoring
  const logAccessAttempt = (success, reason) => {
    try {
      const accessLogs = JSON.parse(localStorage.getItem('accessLogs')) || [];

      accessLogs.push({
        timestamp: new Date().toISOString(),
        path: window.location.pathname,
        requiredRoles,
        requiredPermissions,
        success,
        reason
      });

      // Keep only the last 100 logs to prevent storage issues
      const trimmedLogs = accessLogs.slice(-100);
      localStorage.setItem('accessLogs', JSON.stringify(trimmedLogs));
    } catch (error) {
      console.error('Failed to log access attempt:', error);
    }
  };

  // Perform authorization checks
  useEffect(() => {
    try {
      // Default to access denied for safety during loading
      if (loading) {
        return;
      }

      // Check authentication first
      if (!isAuthenticated()) {
        setAccessDenied(true);
        setAccessDeniedReason('authentication');
        logAccessAttempt(false, 'Not authenticated');
        return;
      }

      // Check roles if specified
      if (requiredRoles.length > 0) {
        if (!hasRole(requiredRoles)) {
          setAccessDenied(true);
          setAccessDeniedReason('role');
          logAccessAttempt(false, `Missing required role(s): ${requiredRoles.join(', ')}`);
          return;
        }
      }

      // Check permissions if specified
      if (requiredPermissions.length > 0) {
        const missingPermissions = [];

        for (const permission of requiredPermissions) {
          if (!hasPermission(permission)) {
            missingPermissions.push(permission);
          }
        }

        if (missingPermissions.length > 0) {
          setAccessDenied(true);
          setAccessDeniedReason('permission');
          logAccessAttempt(false, `Missing required permission(s): ${missingPermissions.join(', ')}`);
          return;
        }
      }

      // If we get here, access is granted
      setAccessDenied(false);
      logAccessAttempt(true, 'Access granted');
    } catch (error) {
      // Fail securely - any error in the authorization process results in access denial
      console.error('Security error in AuthGuard:', error);
      setSecurityError(true);
      setAccessDenied(true);
      logAccessAttempt(false, `Security error: ${error.message}`);
    }
  }, [loading, isAuthenticated, hasRole, hasPermission, requiredRoles, requiredPermissions]);

  // Show loading state if still checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }

  // Handle security errors - fail closed
  if (securityError) {
    return fallback || <AccessDenied reason="error" redirectPath="/" />;
  }

  // Handle access denied based on reason
  if (accessDenied) {
    switch (accessDeniedReason) {
      case 'authentication':
        return fallback || <Navigate to={redirectPath} replace />;
      case 'role':
        return fallback || <AccessDenied reason="role" redirectPath="/" />;
      case 'permission':
        return fallback || <AccessDenied reason="permission" redirectPath="/" />;
      default:
        return fallback || <AccessDenied reason="error" redirectPath="/" />;
    }
  }

  // User is authorized, render the children
  return children;
};

export default AuthGuard;
