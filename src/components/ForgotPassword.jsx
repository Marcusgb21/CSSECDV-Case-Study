import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import bcrypt from 'bcryptjs';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgetPassword() {
  const [userFound, setUserFound] = useState(null);
  const [message, setMessage] = useState('');
  const [stage, setStage] = useState(1); // 1: identity, 2: security answer, 3: reset password

  const saltRounds = 10;

  const logRecoveryAttempt = ({ stage, email, success, reason }) => {
    const logEntry = {
      stage,
      email: email || 'N/A',
      time: new Date().toISOString(),
      success,
      reason,
    };
  
    const logs = JSON.parse(localStorage.getItem('recoveryLogs')) || [];
    logs.push(logEntry);
    localStorage.setItem('recoveryLogs', JSON.stringify(logs));
  };

  const initialValidationSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Email is required'),
    mobileNumber: Yup.string()
      .matches(/^(\+?\d{1,4}|\d{1,4})?(\s?\d{10})$/, 'Invalid mobile number')
      .required('Mobile number is required'),
  });

  const securityAnswerSchema = Yup.object().shape({
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

  const handleIdentitySubmit = (values) => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const found = users.find(
      (u) => u.email === values.email && u.mobileNumber === values.mobileNumber
    );
    if (found) {
      setUserFound(found);
      setStage(2);
      setMessage('');
      logRecoveryAttempt({
        stage: 1,
        email: found.email,
        success: true,
        reason: "Identity matched"
      });
    } else {
      setMessage('User not found. Check your email and mobile number.');
      logRecoveryAttempt({
        stage: 1,
        email: values.email,
        success: false,
        reason: "User not found"
      });
    }    
  };

  const handleAnswerSubmit = (values) => {
    const isValid = bcrypt.compareSync(values.securityAnswer, userFound.securityAnswerHash);
    if (isValid) {
      setStage(3);
      setMessage('');
      logRecoveryAttempt({
        stage: 2,
        email: userFound.email,
        success: true,
        reason: "Correct security answer"
      });
    } else {
      setMessage('Incorrect security answer.');
      logRecoveryAttempt({
        stage: 2,
        email: userFound.email,
        success: false,
        reason: "Incorrect security answer"
      });
    }    
  };

  const handleResetPassword = (values, resetForm) => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const index = users.findIndex((u) => u.email === userFound.email);

    if (index !== -1) {
      const user = users[index];

      // Initialize password history if it doesn't exist
      if (!user.passwordHistory) {
        user.passwordHistory = [];
      }

      // Check if password is at least one day old (skip for forgot password in some cases)
      const passwordLastChanged = new Date(user.passwordLastChanged || 0);
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      // Only enforce the one-day rule if the user has changed their password before
      // and it's not a first-time password reset (passwordHistory is empty)
      if (user.passwordHistory.length > 0 && passwordLastChanged > oneDayAgo) {
        // Calculate time remaining
        const oneDayAfterChange = new Date(passwordLastChanged);
        oneDayAfterChange.setDate(oneDayAfterChange.getDate() + 1);
        const hoursRemaining = Math.floor((oneDayAfterChange - new Date()) / (1000 * 60 * 60));
        const minutesRemaining = Math.floor(((oneDayAfterChange - new Date()) % (1000 * 60 * 60)) / (1000 * 60));

        setMessage(`Your password was changed recently. For security reasons, you must wait ${hoursRemaining} hours and ${minutesRemaining} minutes before changing it again.`);
        return;
      }

      // Check if the new password matches the current password
      const isCurrentPasswordMatch = bcrypt.compareSync(values.newPassword, user.password);

      if (isCurrentPasswordMatch) {
        setMessage('You cannot reuse your current password. Please choose a different password.');
        return;
      }

      // Check if the new password matches any in history
      const isPasswordReused = user.passwordHistory.some(oldPassword =>
        bcrypt.compareSync(values.newPassword, oldPassword)
      );

      if (isPasswordReused) {
        setMessage('You cannot reuse a previous password. Please choose a different password.');
        return;
      }

      // Hash the new password
      const salt = bcrypt.genSaltSync(saltRounds);
      const hashedNewPassword = bcrypt.hashSync(values.newPassword, salt);

      // Add current password to history before updating
      const updatedPasswordHistory = [...user.passwordHistory, user.password].slice(-5); // Keep last 5 passwords

      // Update user with new password and password history
      users[index] = {
        ...user,
        password: hashedNewPassword,
        passwordHistory: updatedPasswordHistory,
        passwordLastChanged: new Date().toISOString()
      };

      // Save to localStorage
      localStorage.setItem('users', JSON.stringify(users));

      // Log the password change
      const passwordChangeLogs = JSON.parse(localStorage.getItem('passwordChangeLogs')) || [];
      passwordChangeLogs.push({
        email: user.email,
        timestamp: new Date().toISOString(),
        method: 'forgot-password',
        success: true
      });
      localStorage.setItem('passwordChangeLogs', JSON.stringify(passwordChangeLogs));

      // Show success message and reset form
      setMessage('✅ Password successfully updated!');
      logRecoveryAttempt({
        stage: 3,
        email: userFound.email,
        success: true,
        reason: "Password reset successful"
      });      
      setUserFound(null);
      setStage(1);
      resetForm();
    }
  };

  return (
    <div>
      <h1 className="text-3xl text-center mb-6">Forgot Password</h1>

      {stage === 1 && (
        <Formik
          initialValues={{ email: '', mobileNumber: '' }}
          validationSchema={initialValidationSchema}
          onSubmit={(values) => handleIdentitySubmit(values)}
        >
          <Form className="max-w-md mx-auto space-y-4">
            <div>
              <label>Email</label>
              <Field name="email" type="text" className="block w-full border p-2 rounded" />
              <ErrorMessage name="email" component="div" className="text-red-600 text-sm" />
            </div>
            <div>
              <label>Mobile Number</label>
              <Field name="mobileNumber" type="text" className="block w-full border p-2 rounded" />
              <ErrorMessage name="mobileNumber" component="div" className="text-red-600 text-sm" />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
              Next
            </button>
          </Form>
        </Formik>
      )}

      {stage === 2 && (
        <Formik
          initialValues={{ securityAnswer: '' }}
          validationSchema={securityAnswerSchema}
          onSubmit={(values) => handleAnswerSubmit(values)}
        >
          <Form className="max-w-md mx-auto space-y-4 mt-6">
            <p className="font-semibold">Security Question:</p>
            <p className="italic text-blue-700 mb-2">{userFound?.securityQuestion}</p>
            <Field
              name="securityAnswer"
              type="text"
              placeholder="Your Answer"
              className="block w-full border p-2 rounded"
            />
            <ErrorMessage name="securityAnswer" component="div" className="text-red-600 text-sm" />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
              Validate Answer
            </button>
          </Form>
        </Formik>
      )}

      {stage === 3 && (
        <Formik
          initialValues={{ newPassword: '' }}
          validationSchema={newPasswordSchema}
          onSubmit={(values, { resetForm }) => handleResetPassword(values, resetForm)}
        >
          <Form className="max-w-md mx-auto space-y-4 mt-6">
            <label>New Password</label>
            <Field
              name="newPassword"
              type="password"
              className="block w-full border p-2 rounded"
            />
            <ErrorMessage name="newPassword" component="div" className="text-red-600 text-sm" />
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
              Update Password
            </button>
          </Form>
        </Formik>
      )}

      <div className="text-center mt-4">
        <Link to="/login" className="text-blue-600 underline">
          Back to Login
        </Link>
      </div>

      {message && <div className={`text-center mt-4 p-2 rounded ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message}</div>}

      {stage === 3 && (
        <div className="max-w-md mx-auto mt-4 p-3 bg-blue-50 rounded text-sm">
          <h3 className="font-medium text-blue-800">Password Requirements:</h3>
          <ul className="list-disc pl-5 mt-1 text-blue-700 space-y-1">
            <li>At least 8 characters long</li>
            <li>At least one lowercase letter</li>
            <li>At least one uppercase letter</li>
            <li>At least one number</li>
            <li>At least one special character</li>
            <li>Must be different from your previous passwords</li>
            <li>Your current password must be at least one day old before changing</li>
          </ul>
        </div>
      )}
    </div>
  );
}
