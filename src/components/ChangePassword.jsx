import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import bcrypt from 'bcryptjs';
import ReAuthenticate from './ReAuthenticate';

const ChangePassword = () => {
  const { loggedInUser } = useSelector((state) => state.user);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const saltRounds = 10;

  // Password validation schema
  const changePasswordSchema = Yup.object().shape({
    currentPassword: Yup.string().required('Current password is required'),
    newPassword: Yup.string()
      .min(8, 'Password must be at least 8 characters long')
      .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
      .matches(/[A-Z]/, 'Password must contain at least one upper case letter')
      .matches(/\d/, 'Password must contain at least one number')
      .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
      .notOneOf([Yup.ref('currentPassword')], 'New password must be different from current password')
      .required('New password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword')], 'Passwords must match')
      .required('Confirm password is required'),
  });

  const handleSubmit = (values, { resetForm, setSubmitting }) => {
    // Get all users from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Find the current user
    const userIndex = users.findIndex(user => user.email === loggedInUser.email);
    
    if (userIndex === -1) {
      setMessageType('error');
      setMessage('User not found. Please log in again.');
      setSubmitting(false);
      return;
    }

    const user = users[userIndex];
    
    // Verify current password
    const isCurrentPasswordValid = bcrypt.compareSync(values.currentPassword, user.password);
    
    if (!isCurrentPasswordValid) {
      setMessageType('error');
      setMessage('Current password is incorrect.');
      setSubmitting(false);
      return;
    }

    // Check if password is at least one day old
    const passwordLastChanged = new Date(user.passwordLastChanged || 0);
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    if (passwordLastChanged > oneDayAgo) {
      setMessageType('error');
      setMessage('Your password must be at least one day old before it can be changed.');
      setSubmitting(false);
      return;
    }

    // Check if new password matches any of the previous passwords
    const passwordHistory = user.passwordHistory || [];
    
    // Check if the new password matches any in history
    const isPasswordReused = passwordHistory.some(oldPassword => 
      bcrypt.compareSync(values.newPassword, oldPassword)
    );
    
    if (isPasswordReused) {
      setMessageType('error');
      setMessage('You cannot reuse a previous password. Please choose a different password.');
      setSubmitting(false);
      return;
    }

    // Hash the new password
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedNewPassword = bcrypt.hashSync(values.newPassword, salt);
    
    // Add current password to history before updating
    const updatedPasswordHistory = [...passwordHistory, user.password].slice(-5); // Keep last 5 passwords
    
    // Update user with new password and password history
    users[userIndex] = {
      ...user,
      password: hashedNewPassword,
      passwordHistory: updatedPasswordHistory,
      passwordLastChanged: new Date().toISOString()
    };
    
    // Save updated users back to localStorage
    localStorage.setItem('users', JSON.stringify(users));
    
    // Log the password change
    const passwordChangeLogs = JSON.parse(localStorage.getItem('passwordChangeLogs')) || [];
    passwordChangeLogs.push({
      email: user.email,
      timestamp: new Date().toISOString(),
      success: true
    });
    localStorage.setItem('passwordChangeLogs', JSON.stringify(passwordChangeLogs));
    
    // Show success message
    setMessageType('success');
    setMessage('Password changed successfully!');
    resetForm();
    setSubmitting(false);
  };

  const handlePasswordChange = async (values) => {
    try {
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      
      if (!currentUser) {
        throw new Error('User not found');
      }

      const userIndex = users.findIndex(u => u.email === currentUser.email);
      if (userIndex === -1) {
        throw new Error('User not found');
      }

      const user = users[userIndex];

      // Check if the new password is in the password history
      if (user.passwordHistory) {
        const isPasswordUsed = user.passwordHistory.some(oldPassword => 
          bcrypt.compareSync(values.newPassword, oldPassword)
        );
        if (isPasswordUsed) {
          throw new Error('This password has been used before. Please choose a different password.');
        }
      }

      // Hash the new password
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(values.newPassword, salt);

      // Update password history
      if (!user.passwordHistory) {
        user.passwordHistory = [];
      }
      user.passwordHistory.push(user.password);
      if (user.passwordHistory.length > 5) {
        user.passwordHistory.shift(); // Keep only the last 5 passwords
      }

      // Update user's password and last changed date
      user.password = hashedPassword;
      user.passwordLastChanged = new Date().toISOString();

      // Save updated user
      users[userIndex] = user;
      localStorage.setItem('users', JSON.stringify(users));

      // Log the password change
      const authLog = {
        email: user.email,
        time: new Date().toISOString(),
        operation: 'password_change',
        success: true
      };

      const prevLogs = JSON.parse(localStorage.getItem('authLogs')) || [];
      prevLogs.push(authLog);
      localStorage.setItem('authLogs', JSON.stringify(prevLogs));

      alert('Password changed successfully!');
      navigate('/');
    } catch (error) {
      setError(error.message);
      
      // Log the failed password change attempt
      const authLog = {
        email: currentUser.email,
        time: new Date().toISOString(),
        operation: 'password_change',
        success: false,
        reason: error.message
      };

      const prevLogs = JSON.parse(localStorage.getItem('authLogs')) || [];
      prevLogs.push(authLog);
      localStorage.setItem('authLogs', JSON.stringify(prevLogs));
    }
  };

  if (!loggedInUser) {
    return (
      <div className="container mx-auto p-4">
        <p>Please log in to change your password.</p>
        <Link to="/login" className="text-blue-600 hover:underline">Go to Login</Link>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <ReAuthenticate
        onSuccess={() => setIsAuthenticated(true)}
        onCancel={() => navigate('/')}
      />
    );
  }

  // Calculate time remaining before password can be changed
  const calculateTimeRemaining = () => {
    if (!loggedInUser || !loggedInUser.passwordLastChanged) return null;
    
    const passwordLastChanged = new Date(loggedInUser.passwordLastChanged);
    const oneDayLater = new Date(passwordLastChanged);
    oneDayLater.setDate(oneDayLater.getDate() + 1);
    
    const now = new Date();
    if (now >= oneDayLater) return null; // Password is already eligible for change
    
    const timeRemaining = oneDayLater - now;
    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hoursRemaining, minutesRemaining };
  };
  
  const timeRemaining = calculateTimeRemaining();
  const canChangePassword = !timeRemaining;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Change Password</h1>
      
      <div className="mb-6">
        <Link to="/" className="text-blue-600 hover:underline">Back to Home</Link>
      </div>
      
      <div className="bg-white p-6 rounded shadow max-w-md mx-auto">
        {!canChangePassword && (
          <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded">
            <p className="font-medium">Password cannot be changed yet</p>
            <p>You must wait {timeRemaining.hoursRemaining} hours and {timeRemaining.minutesRemaining} minutes before changing your password again.</p>
          </div>
        )}
        
        <Formik
          initialValues={{
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          }}
          validationSchema={changePasswordSchema}
          onSubmit={async (values, actions) => {
            try {
              await changePasswordSchema.validate(values, { abortEarly: false });
              
              // ✅ Validation passed — continue with password change
              handlePasswordChange(values);
          
            } catch (validationErrors) {
              if (validationErrors.inner && validationErrors.inner.length > 0) {
                const validationLog = validationErrors.inner.map((error) => ({
                  email: loggedInUser?.email || 'unknown',
                  field: error.path,
                  message: error.message,
                  time: new Date().toISOString(),
                  operation: 'password_change',
                  success: false
                }));
          
                const prevLogs = JSON.parse(localStorage.getItem('authLogs')) || [];
                localStorage.setItem('authLogs', JSON.stringify([...prevLogs, ...validationLog]));
              }
          
              actions.setSubmitting(false);
            }
          }}          
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
                <Field
                  type="password"
                  name="currentPassword"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  disabled={!canChangePassword}
                />
                <ErrorMessage name="currentPassword" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                <Field
                  type="password"
                  name="newPassword"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  disabled={!canChangePassword}
                />
                <ErrorMessage name="newPassword" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <Field
                  type="password"
                  name="confirmPassword"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  disabled={!canChangePassword}
                />
                <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !canChangePassword}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${canChangePassword ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  {isSubmitting ? 'Changing Password...' : 'Change Password'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
        
        {message && (
          <div className={`mt-4 p-3 rounded ${messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}
        
        <div className="mt-4 text-sm text-gray-600">
          <h3 className="font-medium">Password Requirements:</h3>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>At least 8 characters long</li>
            <li>At least one lowercase letter</li>
            <li>At least one uppercase letter</li>
            <li>At least one number</li>
            <li>At least one special character</li>
            <li>Must be different from your previous passwords</li>
            <li>Your current password must be at least one day old</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
