import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import bcrypt from 'bcryptjs';

const ReAuthenticate = ({ onSuccess, onCancel }) => {
    const dispatch = useDispatch();
    const { loggedInUser } = useSelector((state) => state.user);
    const [error, setError] = useState('');

    const validationSchema = Yup.object().shape({
        password: Yup.string()
            .required('Password is required')
    });

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.email === loggedInUser.email);

            if (!user) {
                throw new Error('User not found');
            }

            const isPasswordMatch = bcrypt.compareSync(values.password, user.password);

            if (!isPasswordMatch) {
                throw new Error('Invalid password');
            }

            // Log the re-authentication attempt
            const authLog = {
                email: loggedInUser.email,
                time: new Date().toISOString(),
                operation: 're-authentication',
                success: true
            };

            const prevLogs = JSON.parse(localStorage.getItem('authLogs')) || [];
            prevLogs.push(authLog);
            localStorage.setItem('authLogs', JSON.stringify(prevLogs));

            onSuccess();
        } catch (error) {
            setError(error.message);
            
            // Log the failed re-authentication attempt
            const authLog = {
                email: loggedInUser.email,
                time: new Date().toISOString(),
                operation: 're-authentication',
                success: false,
                reason: error.message
            };

            const prevLogs = JSON.parse(localStorage.getItem('authLogs')) || [];
            prevLogs.push(authLog);
            localStorage.setItem('authLogs', JSON.stringify(prevLogs));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-sm mx-auto p-4">
            <h2 className="text-xl font-bold mb-4">Re-authentication Required</h2>
            <p className="mb-4">Please enter your password to continue with this operation.</p>
            
            <Formik
                initialValues={{ password: '' }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <div className="mb-4">
                            <label htmlFor="password" className="block mb-2">Password:</label>
                            <Field
                                name="password"
                                type="password"
                                className="w-full p-2 border rounded"
                            />
                            <ErrorMessage name="password" component="div" className="text-red-500" />
                        </div>

                        {error && <div className="text-red-500 mb-4">{error}</div>}

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                {isSubmitting ? 'Verifying...' : 'Verify'}
                            </button>
                            <button
                                type="button"
                                onClick={onCancel}
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default ReAuthenticate; 