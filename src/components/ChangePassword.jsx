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
  const [messageType, setMessageType] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const saltRounds = 10;

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

  const logAccessControl = (entry) => {
    const logs = JSON.parse(localStorage.getItem('authLogs')) || [];
    logs.push({ ...entry, time: new Date().toISOString() });
    localStorage.setItem('authLogs', JSON.stringify(logs));
  };

  const handlePasswordChange = async (values) => {
    try {
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const currentUser = loggedInUser || JSON.parse(localStorage.getItem('currentUser'));

      if (!currentUser) throw new Error('No authenticated user');

      const userIndex = users.findIndex(u => u.email === currentUser.email);
      if (userIndex === -1) throw new Error('User not found');

      const user = users[userIndex];

      const passwordLastChanged = new Date(user.passwordLastChanged || 0);
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      if (passwordLastChanged > oneDayAgo) {
        throw new Error('Password too recent to change');
      }

      if (user.passwordHistory?.some(p => bcrypt.compareSync(values.newPassword, p))) {
        throw new Error('Password reuse not allowed');
      }

      const hashed = bcrypt.hashSync(values.newPassword, saltRounds);
      user.passwordHistory = [...(user.passwordHistory || []), user.password].slice(-5);
      user.password = hashed;
      user.passwordLastChanged = new Date().toISOString();
      users[userIndex] = user;
      localStorage.setItem('users', JSON.stringify(users));

      logAccessControl({ email: user.email, operation: 'password_change', success: true });

      alert('Password changed successfully');
      navigate('/');
    } catch (err) {
      setError(err.message);
      logAccessControl({ email: loggedInUser?.email || 'unknown', operation: 'password_change', success: false, reason: err.message });
    }
  };

  if (!loggedInUser) {
    logAccessControl({ email: 'unknown', operation: 'password_change', success: false, reason: 'Not logged in' });
    return <div className="p-4">Please log in to change your password. <Link to="/login" className="text-blue-600">Login</Link></div>;
  }

  if (!isAuthenticated) {
    return <ReAuthenticate onSuccess={() => setIsAuthenticated(true)} onCancel={() => navigate('/')} />;
  }

  const timeRemaining = (() => {
    const last = new Date(loggedInUser.passwordLastChanged);
    const diff = new Date(last.getTime() + 86400000) - Date.now();
    return diff > 0 ? {
      hours: Math.floor(diff / (1000 * 60 * 60)),
      minutes: Math.floor((diff / (1000 * 60)) % 60)
    } : null;
  })();

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Change Password</h1>
      {timeRemaining && <div className="bg-yellow-100 text-yellow-800 p-3 mb-4 rounded">Wait {timeRemaining.hours}h {timeRemaining.minutes}m before next change</div>}

      <Formik
        initialValues={{ currentPassword: '', newPassword: '', confirmPassword: '' }}
        validationSchema={changePasswordSchema}
        onSubmit={async (values, actions) => {
          try {
            await changePasswordSchema.validate(values, { abortEarly: false });
            handlePasswordChange(values);
          } catch (err) {
            if (err.inner) {
              err.inner.forEach(e => {
                logAccessControl({
                  email: loggedInUser?.email || 'unknown',
                  operation: 'password_change',
                  success: false,
                  reason: `${e.path}: ${e.message}`
                });
              });
            }
            actions.setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div>
              <label>Current Password</label>
              <Field type="password" name="currentPassword" className="w-full border p-2 rounded" disabled={!!timeRemaining} />
              <ErrorMessage name="currentPassword" component="div" className="text-red-600 text-sm" />
            </div>
            <div>
              <label>New Password</label>
              <Field type="password" name="newPassword" className="w-full border p-2 rounded" disabled={!!timeRemaining} />
              <ErrorMessage name="newPassword" component="div" className="text-red-600 text-sm" />
            </div>
            <div>
              <label>Confirm Password</label>
              <Field type="password" name="confirmPassword" className="w-full border p-2 rounded" disabled={!!timeRemaining} />
              <ErrorMessage name="confirmPassword" component="div" className="text-red-600 text-sm" />
            </div>
            <button type="submit" disabled={isSubmitting || !!timeRemaining} className="bg-blue-600 text-white px-4 py-2 rounded">
              {isSubmitting ? 'Processing...' : 'Change Password'}
            </button>
          </Form>
        )}
      </Formik>

      {message && <div className={`mt-4 p-3 rounded ${messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{message}</div>}
    </div>
  );
};

export default ChangePassword;
