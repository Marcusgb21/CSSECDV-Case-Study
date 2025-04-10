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
    } else {
      setMessage('User not found. Check your email and mobile number.');
    }
  };

  const handleAnswerSubmit = (values) => {
    const isValid = bcrypt.compareSync(values.securityAnswer, userFound.securityAnswerHash);
    if (isValid) {
      setStage(3);
      setMessage('');
    } else {
      setMessage('Incorrect security answer.');
    }
  };

  const handleResetPassword = (values, resetForm) => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const index = users.findIndex((u) => u.email === userFound.email);

    if (index !== -1) {
      const salt = bcrypt.genSaltSync(saltRounds);
      users[index].password = bcrypt.hashSync(values.newPassword, salt);
      localStorage.setItem('users', JSON.stringify(users));
      setMessage('✅ Password successfully updated!');
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

      {message && <div className="text-center text-red-500 mt-4">{message}</div>}
    </div>
  );
}
