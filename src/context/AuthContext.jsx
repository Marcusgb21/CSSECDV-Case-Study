import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// Create the context
const AuthContext = createContext(null);

// Provider component
export const AuthProvider = ({ children }) => {
  const { loggedInUser } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking authentication status
    setLoading(false);
  }, []);

  // Check if user has required role - fails securely
  const hasRole = (requiredRoles) => {
    try {
      // Default to false (no access) if user is not logged in
      if (!loggedInUser) return false;

      // Handle non-array input gracefully
      if (!Array.isArray(requiredRoles)) {
        requiredRoles = [requiredRoles];
      }

      // If user has no role or role is undefined/null, deny access
      if (!loggedInUser.role) {
        console.warn('Security warning: User has no role assigned');
        return false;
      }

      // Check if user's role is in the required roles list
      return requiredRoles.includes(loggedInUser.role);
    } catch (error) {
      // Log the error but don't expose it to the user
      console.error('Security error in role verification:', error);

      // Log security event
      logSecurityEvent('role_verification_error', {
        userId: loggedInUser?.email,
        error: error.message
      });

      // Always fail closed (deny access) on errors
      return false;
    }
  };

  // Check if user is authenticated - fails securely
  const isAuthenticated = () => {
    try {
      // Verify user object exists and has minimum required properties
      return !!loggedInUser &&
             !!loggedInUser.email &&
             !!loggedInUser.role;
    } catch (error) {
      console.error('Security error in authentication verification:', error);

      // Log security event
      logSecurityEvent('authentication_verification_error', {
        error: error.message
      });

      // Fail closed on errors
      return false;
    }
  };

  // Get user's role - fails securely
  const getUserRole = () => {
    try {
      return loggedInUser?.role || null;
    } catch (error) {
      console.error('Security error in getting user role:', error);

      // Log security event
      logSecurityEvent('get_user_role_error', {
        userId: loggedInUser?.email,
        error: error.message
      });

      // Return null on error
      return null;
    }
  };

  // Helper function to log security events
  const logSecurityEvent = (eventType, details) => {
    try {
      // Get existing security logs
      const securityLogs = JSON.parse(localStorage.getItem('securityLogs')) || [];

      // Add new log entry
      securityLogs.push({
        eventType,
        timestamp: new Date().toISOString(),
        details
      });

      // Save updated logs
      localStorage.setItem('securityLogs', JSON.stringify(securityLogs));
    } catch (error) {
      // If even logging fails, just log to console as last resort
      console.error('Failed to log security event:', error);
    }
  };

  // Check if user has permission for a specific action - fails securely
  const hasPermission = (permission) => {
    try {
      // Default to false (no access) if user is not logged in
      if (!loggedInUser) return false;

      // Validate input
      if (!permission || typeof permission !== 'string') {
        console.warn('Security warning: Invalid permission requested');
        return false;
      }

      // Define role-based permissions
      const rolePermissions = {
        'Website Administrator': ['read', 'write', 'delete', 'manage_users', 'manage_roles'],
        'Product Manager': ['read', 'write', 'manage_products'],
        'Customer': ['read', 'view_products']
      };

      const userRole = loggedInUser.role;

      // If role is invalid or not found in permissions map, deny access
      if (!userRole || !rolePermissions[userRole]) {
        console.warn(`Security warning: User has invalid role: ${userRole}`);
        return false;
      }

      const permissions = rolePermissions[userRole];

      // Check if permission exists in the user's role permissions
      return permissions.includes(permission);
    } catch (error) {
      console.error('Security error in permission verification:', error);

      // Log security event
      logSecurityEvent('permission_verification_error', {
        userId: loggedInUser?.email,
        permission,
        error: error.message
      });

      // Always fail closed (deny access) on errors
      return false;
    }
  };

  // Value to be provided to consumers
  const value = {
    user: loggedInUser,
    loading,
    isAuthenticated,
    hasRole,
    getUserRole,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
