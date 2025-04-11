import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Component that conditionally renders its children based on user permissions
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string[]} props.requiredRoles - Roles that are allowed to see the children
 * @param {string[]} props.requiredPermissions - Permissions required to see the children
 * @param {React.ReactNode} props.fallback - Component to render if unauthorized (optional)
 */
const PermissionCheck = ({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  fallback = null
}) => {
  const { hasRole, hasPermission } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Perform authorization checks in useEffect to handle errors safely
  useEffect(() => {
    try {
      // Check if user has required roles
      const hasRequiredRole = requiredRoles.length === 0 || hasRole(requiredRoles);

      // Check if user has required permissions
      let hasRequiredPermissions = true;

      if (requiredPermissions.length > 0) {
        // Check each permission individually to fail securely
        for (const permission of requiredPermissions) {
          if (!hasPermission(permission)) {
            hasRequiredPermissions = false;
            break;
          }
        }
      }

      // Set authorization state based on both checks
      setIsAuthorized(hasRequiredRole && hasRequiredPermissions);
    } catch (error) {
      // Log the error but don't expose it to the user
      console.error('Security error in PermissionCheck:', error);

      // Log security event
      try {
        const securityLogs = JSON.parse(localStorage.getItem('securityLogs')) || [];
        securityLogs.push({
          eventType: 'permission_check_error',
          timestamp: new Date().toISOString(),
          details: {
            requiredRoles,
            requiredPermissions,
            error: error.message
          }
        });
        localStorage.setItem('securityLogs', JSON.stringify(securityLogs));
      } catch (logError) {
        console.error('Failed to log security event:', logError);
      }

      // Fail closed - deny access on errors
      setIsAuthorized(false);
    }
  }, [hasRole, hasPermission, requiredRoles, requiredPermissions]);

  // Render children only if user is authorized
  if (isAuthorized) {
    return children;
  }

  // Otherwise render fallback or null
  return fallback || null;
};

export default PermissionCheck;
