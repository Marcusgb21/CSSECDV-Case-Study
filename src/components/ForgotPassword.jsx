import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import bcrypt from 'bcryptjs';
import { Link } from 'react-router-dom';

export default function ForgetPassword() {
  const [userFound, setUserFound] = useState(null);
  const [message, setMessage] = useState('');
  const [stage, setStage] = useState(1);

  const saltRounds = 10;

  const logRecoveryAttempt = ({ stage, email, success, reason }) => {
    const logs = JSON.parse(localStorage.getItem('recoveryLogs')) || [];
    logs.push({
      stage,
      email: email || 'N/A',
      time: new Date().toISOString(),
      success,
      reason,
    });
    localStorage.setItem('recoveryLogs', JSON.stringify(logs));
  };

  const identitySchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Email is required'),
    mobileNumber: Yup.string()
      .matches(/^\+?\d{10,14}$/, 'Invalid mobile number')
      .required('Mobile number is required'),
  });

  const answerSchema = Yup.object().shape({
    securityAnswer: Yup.string().required('Answer is required'),
  });

  const newPasswordSchema = Yup.object().shape({
    newPassword: Yup.string()
      .min(8, 'At least 8 characters')
      .matches(/[a-z]/, 'One lowercase required')
      .matches(/[A-Z]/, 'One uppercase required')
      .matches(/\d/, 'One number required')
      .matches(/[!@#$%^&*(),.?":{}|<>]/, 'One special char required')
      .required('New password is required'),
  });

  const handleIdentity = (values) => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const match = users.find(u => u.email === values.email && u.mobileNumber === values.mobileNumber);
    if (match) {
      setUserFound(match);
      setStage(2);
      logRecoveryAttempt({ stage: 1, email: match.email, success: true, reason: 'Identity verified' });
    } else {
      setMessage('User not found');
      logRecoveryAttempt({ stage: 1, email: values.email, success: false, reason: 'No match found' });
    }
  };

  const handleAnswer = (values) => {
    if (!userFound) return;
    const match = bcrypt.compareSync(values.securityAnswer, userFound.securityAnswerHash);
    if (match) {
      setStage(3);
      logRecoveryAttempt({ stage: 2, email: userFound.email, success: true, reason: 'Correct answer' });
    } else {
      setMessage('Incorrect answer');
      logRecoveryAttempt({ stage: 2, email: userFound.email, success: false, reason: 'Wrong answer' });
    }
  };

  const handleReset = ({ newPassword }, resetForm) => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const index = users.findIndex(u => u.email === userFound.email);
    if (index === -1) return;

    const user = users[index];
    const recent = new Date(user.passwordLastChanged || 0);
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 86400000);

    if (user.passwordHistory?.length > 0 && recent > oneDayAgo) {
      setMessage('Wait 24h before changing password again.');
      return;
    }

    if (bcrypt.compareSync(newPassword, user.password)) {
      setMessage('Cannot reuse current password.');
      return;
    }

    if (user.passwordHistory?.some(p => bcrypt.compareSync(newPassword, p))) {
      setMessage('Cannot reuse previous passwords.');
      return;
    }

    const hashed = bcrypt.hashSync(newPassword, saltRounds);
    user.passwordHistory = [...(user.passwordHistory || []), user.password].slice(-5);
    user.password = hashed;
    user.passwordLastChanged = new Date().toISOString();

    users[index] = user;
    localStorage.setItem('users', JSON.stringify(users));

    const logs = JSON.parse(localStorage.getItem('passwordChangeLogs')) || [];
    logs.push({ email: user.email, method: 'forgot', time: new Date().toISOString(), success: true });
    localStorage.setItem('passwordChangeLogs', JSON.stringify(logs));

    setMessage('✅ Password reset successful');
    setUserFound(null);
    setStage(1);
    resetForm();
    logRecoveryAttempt({ stage: 3, email: user.email, success: true, reason: 'Password reset' });
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>

      {stage === 1 && (
        <Formik
          initialValues={{ email: '', mobileNumber: '' }}
          validationSchema={identitySchema}
          onSubmit={handleIdentity}
        >
          <Form className="space-y-4">
            <div>
              <label>Email</label>
              <Field name="email" type="text" className="w-full border p-2 rounded" />
              <ErrorMessage name="email" component="div" className="text-red-600 text-sm" />
            </div>
            <div>
              <label>Mobile Number</label>
              <Field name="mobileNumber" type="text" className="w-full border p-2 rounded" />
              <ErrorMessage name="mobileNumber" component="div" className="text-red-600 text-sm" />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Next</button>
          </Form>
        </Formik>
      )}

      {stage === 2 && (
        <Formik
          initialValues={{ securityAnswer: '' }}
          validationSchema={answerSchema}
          onSubmit={handleAnswer}
        >
          <Form className="space-y-4 mt-4">
            <p className="text-gray-700">{userFound?.securityQuestion}</p>
            <Field name="securityAnswer" type="text" className="w-full border p-2 rounded" />
            <ErrorMessage name="securityAnswer" component="div" className="text-red-600 text-sm" />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Verify</button>
          </Form>
        </Formik>
      )}

      {stage === 3 && (
        <Formik
          initialValues={{ newPassword: '' }}
          validationSchema={newPasswordSchema}
          onSubmit={(values, { resetForm }) => handleReset(values, resetForm)}
        >
          <Form className="space-y-4 mt-4">
            <label>New Password</label>
            <Field name="newPassword" type="password" className="w-full border p-2 rounded" />
            <ErrorMessage name="newPassword" component="div" className="text-red-600 text-sm" />
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Update</button>
          </Form>
        </Formik>
      )}

      <div className="text-center mt-4">
        <Link to="/login" className="text-blue-600 underline">Back to Login</Link>
      </div>

      {message && (
        <div className={`text-center mt-4 p-2 rounded ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message}</div>
      )}
    </div>
  );
}