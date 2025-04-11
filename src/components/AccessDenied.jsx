import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Component to display when access is denied
 * @param {Object} props - Component props
 * @param {string} props.reason - Reason for access denial ('authentication', 'role', 'permission', or 'error')
 * @param {string} props.message - Custom message to display (optional)
 * @param {string} props.redirectPath - Path to redirect to (optional)
 */
const AccessDenied = ({ 
  reason = 'permission', 
  message = null,
  redirectPath = '/'
}) => {
  const { user, getUserRole } = useAuth();
  const userRole = getUserRole();
  
  // Get appropriate message based on reason
  const getDefaultMessage = () => {
    switch (reason) {
      case 'authentication':
        return 'You need to be logged in to access this page.';
      case 'role':
        return `You don't have the required role to access this page.`;
      case 'permission':
        return `You don't have the required permissions to access this page.`;
      case 'error':
        return 'An error occurred while checking your access. For security reasons, access has been denied.';
      default:
        return 'Access denied.';
    }
  };
  
  // Use custom message if provided, otherwise use default
  const displayMessage = message || getDefaultMessage();
  
  return (
    <div className="container mx-auto p-8 text-center">
      <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-md max-w-2xl mx-auto">
        <div className="flex items-center mb-4">
          <svg className="w-8 h-8 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <h2 className="text-xl font-bold text-red-700">Access Denied</h2>
        </div>
        
        <p className="text-gray-700 mb-4">{displayMessage}</p>
        
        {user && (
          <div className="bg-white p-4 rounded mb-4 text-left">
            <p className="text-sm text-gray-600 mb-2">You are currently logged in as:</p>
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-gray-600">Role: {userRole || 'None'}</p>
          </div>
        )}
        
        <div className="flex justify-center space-x-4">
          <Link 
            to={redirectPath} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go Back
          </Link>
          
          {!user && (
            <Link 
              to="/login" 
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Log In
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
