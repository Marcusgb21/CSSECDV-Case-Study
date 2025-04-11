import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PermissionCheck from './PermissionCheck';

const Dashboard = ({ lastAttemptInfo }) => {
  const { user, getUserRole } = useAuth();
  const userRole = getUserRole();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Main Dashboard</h1>

      {lastAttemptInfo && (
        <div className="mb-6 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">Last Login Attempt:</h3>
          <p className={lastAttemptInfo.success ? "text-green-600" : "text-red-600"}>
            {lastAttemptInfo.success
              ? `Last successful login: ${lastAttemptInfo.time}`
              : `Last failed login attempt: ${lastAttemptInfo.time} (${lastAttemptInfo.reason})`
            }
          </p>
        </div>
      )}

      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-2">Welcome, {user?.name}!</h2>
        <p className="mb-4">Your role: <span className="font-medium">{userRole || 'User'}</span></p>

        <div className="flex flex-wrap gap-4 mb-6">
          <PermissionCheck requiredRoles={['Website Administrator']}>
            <Link
              to="/admin-dashboard"
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Admin Dashboard
            </Link>
          </PermissionCheck>

          <PermissionCheck requiredRoles={['Product Manager', 'Website Administrator']}>
            <Link
              to="/product-manager-dashboard"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Product Manager Dashboard
            </Link>
          </PermissionCheck>

          <PermissionCheck requiredRoles={['Customer', 'Product Manager', 'Website Administrator']}>
            <Link
              to="/customer-dashboard"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Customer Dashboard
            </Link>
          </PermissionCheck>

          <Link
            to="/change-password"
            className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
          >
            Change Password
          </Link>

          <Link
            to="/login"
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Logout
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Your Permissions</h2>

          <PermissionCheck
            requiredPermissions={['read']}
            fallback={<p className="text-red-500">You don't have read permission</p>}
          >
            <div className="mb-2 p-2 bg-green-100 text-green-800 rounded">
              You have read permission
            </div>
          </PermissionCheck>

          <PermissionCheck
            requiredPermissions={['write']}
            fallback={<p className="text-red-500">You don't have write permission</p>}
          >
            <div className="mb-2 p-2 bg-green-100 text-green-800 rounded">
              You have write permission
            </div>
          </PermissionCheck>

          <PermissionCheck
            requiredPermissions={['delete']}
            fallback={<p className="text-red-500">You don't have delete permission</p>}
          >
            <div className="mb-2 p-2 bg-green-100 text-green-800 rounded">
              You have delete permission
            </div>
          </PermissionCheck>

          <PermissionCheck
            requiredPermissions={['manage_users']}
            fallback={<p className="text-red-500">You don't have user management permission</p>}
          >
            <div className="mb-2 p-2 bg-green-100 text-green-800 rounded">
              You have user management permission
            </div>
          </PermissionCheck>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Role-Based Content</h2>

          <PermissionCheck requiredRoles={['Website Administrator']}>
            <div className="mb-4 p-3 bg-purple-100 rounded">
              <h3 className="font-medium text-purple-800">Admin Content</h3>
              <p className="text-purple-700">This content is only visible to administrators.</p>
            </div>
          </PermissionCheck>

          <PermissionCheck requiredRoles={['Product Manager']}>
            <div className="mb-4 p-3 bg-green-100 rounded">
              <h3 className="font-medium text-green-800">Product Manager Content</h3>
              <p className="text-green-700">This content is only visible to product managers.</p>
            </div>
          </PermissionCheck>

          <PermissionCheck requiredRoles={['Customer']}>
            <div className="mb-4 p-3 bg-blue-100 rounded">
              <h3 className="font-medium text-blue-800">Customer Content</h3>
              <p className="text-blue-700">This content is only visible to customers.</p>
            </div>
          </PermissionCheck>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
