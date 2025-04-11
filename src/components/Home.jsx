import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import { useAuth } from '../context/AuthContext';

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

  const { isAuthenticated } = useAuth();

  // If no user is logged in, redirect to login
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Use the Dashboard component which uses our new authorization system
  return <Dashboard lastAttemptInfo={lastAttemptInfo} />;
};

export default Home;
