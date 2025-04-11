import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';
import { isAdmin, isProductManager, isCustomer } from '../features/user';

const Home = () => {
  const { loggedInUser } = useSelector((state) => state.user);
  const [lastAttemptInfo, setLastAttemptInfo] = useState(null);

  // Migrate existing users to have roles and password history if they don't already
  useEffect(() => {
    const migrateUsers = () => {
      const users = JSON.parse(localStorage.getItem('users')) || [];
      let needsUpdate = false;

      const updatedUsers = users.map(user => {
        let updatedUser = { ...user };

        // Add role if missing
        if (!updatedUser.role) {
          needsUpdate = true;
          updatedUser.role = 'Customer'; // Default role
        }

        // Add password history if missing
        if (!updatedUser.passwordHistory) {
          needsUpdate = true;
          updatedUser.passwordHistory = []; // Initialize empty password history
        }

        // Add password last changed date if missing
        if (!updatedUser.passwordLastChanged) {
          needsUpdate = true;
          updatedUser.passwordLastChanged = new Date().toISOString();
        }

        return updatedUser;
      });

      if (needsUpdate) {
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        console.log('Migrated users to have roles and password history');
      }
    };

    migrateUsers();
  }, []);

  // Get last login attempt information
  useEffect(() => {
    if (loggedInUser) {
      const authLogs = JSON.parse(localStorage.getItem('authLogs')) || [];
      const lastAttempt = authLogs
        .filter(log => log.emailOrMobile === loggedInUser.email)
        .sort((a, b) => new Date(b.time) - new Date(a.time))[1];

      if (lastAttempt) {
        const lastAttemptTime = new Date(lastAttempt.time).toLocaleString();
        setLastAttemptInfo({
          time: lastAttemptTime,
          success: lastAttempt.success,
          reason: lastAttempt.reason
        });
      }
    }
  }, [loggedInUser]);

  // If no user is logged in, redirect to login
  if (!loggedInUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Welcome to the Dashboard</h1>

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
        <h2 className="text-xl font-semibold mb-2">Hello, {loggedInUser.name}!</h2>
        <p className="mb-4">You are logged in as: <span className="font-medium">{loggedInUser.role || 'User'}</span></p>

        <div className="flex flex-wrap gap-4">
          {isAdmin(loggedInUser) && (
            <Link
              to="/admin-dashboard"
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Admin Dashboard
            </Link>
          )}

          {isProductManager(loggedInUser) && (
            <Link
              to="/product-manager-dashboard"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Product Manager Dashboard
            </Link>
          )}

          {isCustomer(loggedInUser) && (
            <Link
              to="/customer-dashboard"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Customer Dashboard
            </Link>
          )}

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

      <div className="bg-gray-100 p-4 rounded">
        <h3 className="font-medium mb-2">Your Account Information:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Name: {loggedInUser.name}</li>
          <li>Email: {loggedInUser.email}</li>
          <li>Mobile: {loggedInUser.mobileNumber}</li>
          <li>Role: {loggedInUser.role || 'Not assigned'}</li>
        </ul>
      </div>
    </div>
  );
};

export default Home;
