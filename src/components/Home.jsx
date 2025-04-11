import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';
import { isAdmin, isProductManager, isCustomer } from '../features/user';

const Home = () => {
  const { loggedInUser } = useSelector((state) => state.user);

  // Migrate existing users to have roles if they don't already
  useEffect(() => {
    const migrateUsersToHaveRoles = () => {
      const users = JSON.parse(localStorage.getItem('users')) || [];
      let needsUpdate = false;

      const updatedUsers = users.map(user => {
        if (!user.role) {
          needsUpdate = true;
          return { ...user, role: 'Customer' }; // Default role
        }
        return user;
      });

      if (needsUpdate) {
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        console.log('Migrated users to have roles');
      }
    };

    migrateUsersToHaveRoles();
  }, []);

  // If no user is logged in, redirect to login
  if (!loggedInUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Welcome to the Dashboard</h1>

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
