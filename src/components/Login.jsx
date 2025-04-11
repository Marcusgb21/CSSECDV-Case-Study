import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { loginRequest, loginSuccess, loginFailure, clearError } from '../features/user';
import { useState, useEffect } from 'react';
import bcrypt from 'bcryptjs';
import { Link, useNavigate } from 'react-router-dom';

export default function Login(){
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [storedUsers, setStoredUsers] = useState([]);
    const {status, error, loggedInUser, isLocked, lockUntil} = useSelector((state) => state.user);
    const [currentUser, setCurrentUser] = useState(null);
    const [lastAttemptInfo, setLastAttemptInfo] = useState(null);

    const mobileNumberRegex = /^(\+?\d{1,4}|\d{1,4})?(\s?\d{10})$/;

    const lockTimeLeft = lockUntil ? Math.max(0, lockUntil - Date.now()) : 0;

    useEffect(() => {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        setCurrentUser(users[users.length - 1] || null);
    }, []);

    useEffect(() => {
        // If user is locked, we update the isLocked flag
        if (lockUntil && Date.now() < lockUntil) {
            dispatch({ type: 'user/setIsLocked', payload: true });
        }
    }, [lockUntil, dispatch]);
    // Lock message based on remaining lock time
    const lockMessage = isLocked && lockTimeLeft > 0
    ? `Account is locked. Try again in ${Math.floor(lockTimeLeft / 1000)} seconds.`
    : null;

    // const printStoredUsers = (e) => {
    //     e.preventDefault()
    //     const users = JSON.parse(localStorage.getItem('users')) || [];
    //     console.log(users);
    // };

    const loginSchema = Yup.object().shape({
        emailOrMobile: Yup.string()
        .test(
            'email or mobile number',
            'Invalid email or mobile number',
            value => {
                const isValidEmail = Yup.string().email().isValidSync(value);
                const isValidNumber = mobileNumberRegex.test(value);
                return isValidEmail || isValidNumber
            }
        )
        .required('This field is required. Input a valid email or mobile number'),
        password: Yup.string()
        .required('Password is required')

    })

    return (
        <div>
            <h1 className='relative z-0 w-full mb-5 group text-center text-3xl'>Login Page</h1>
            <Formik
        initialValues={{
            emailOrMobile:'',
            password:''
        }}
        validationSchema={loginSchema}
        onSubmit={(values, {setSubmitting}) =>{

        dispatch(clearError());
        dispatch(loginRequest());

        setTimeout(() => {
            const logAttempt = {
              emailOrMobile: values.emailOrMobile,
              time: new Date().toISOString(),
              success: false,
              reason: null
            };
          
            try {
              const users = JSON.parse(localStorage.getItem('users')) || [];
          
              const user = users.find(u => u.email === values.emailOrMobile || u.mobileNumber === values.emailOrMobile);
          
              if (!user) {
                logAttempt.reason = 'User not found';
                throw new Error('User not found! Please register');
              }
          
              const isPasswordMatch = bcrypt.compareSync(values.password, user.password);
          
              if (!isPasswordMatch) {
                logAttempt.reason = 'Incorrect password';
                throw new Error('Invalid login credentials');
              }
          
              if (user.lockUntil && Date.now() < user.lockUntil) {
                logAttempt.reason = 'Account locked';
                throw new Error('Account is temporarily locked. Please try again later.');
              }
          
              logAttempt.success = true;
              logAttempt.reason = 'Login successful';
              dispatch(loginSuccess(user));
          
              const authLogs = JSON.parse(localStorage.getItem('authLogs')) || [];
              authLogs.push(logAttempt);
              localStorage.setItem('authLogs', JSON.stringify(authLogs));
          
              const updatedUsers = users.map(u => {
                if (u.email === user.email) {
                  return {
                    ...u,
                    failedAttempts: 0,
                    lockUntil: null,
                  };
                }
                return u;
              });
              localStorage.setItem('users', JSON.stringify(updatedUsers));
          
              navigate('/');
          
            } catch (error) {
              dispatch(loginFailure(error.message));
              logAttempt.success = false;
              logAttempt.reason = error.message;
          
              const prevLogs = JSON.parse(localStorage.getItem('authLogs')) || [];
              prevLogs.push(logAttempt);
              localStorage.setItem('authLogs', JSON.stringify(prevLogs));
          
              const users = JSON.parse(localStorage.getItem('users')) || [];
              const updatedUsers = users.map((u) => {
                if (u.email === values.emailOrMobile) {
                  return {
                    ...u,
                    failedAttempts: (u.failedAttempts || 0) + 1,
                    lockUntil: (u.failedAttempts || 0) >= 4 ? Date.now() + 5 * 60 * 1000 : null,
                  };
                }
                return u;
              });
              localStorage.setItem('users', JSON.stringify(updatedUsers));
            }
          
            setSubmitting(false);
          }, 1000);          
        }}
        >
            {({ isSubmitting, errors, touched}) =>
            (
                <Form className='max-w-sm mx-auto'>
                <div className='mb-5'>
                <label htmlFor='emailorMobile' className='block mb-2 text-sm font-medium text-gray-900 dark:text-black'>Email or Mobile Number: </label>
                <Field name="emailOrMobile" type="text" placeholder="Email or Mobile Number" className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-100 dark:border-gray-100 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500'/>
                {errors.emailOrMobile && touched.emailOrMobile ? (
                        <div style={{ color: 'red' }}>{errors.emailOrMobile} </div>
                    ) : null}
                </div>

                <div className='mb-5'>
                <label htmlFor='password' className='block mb-2 text-sm font-medium text-gray-900 dark:text-black'>Password</label>
                <Field name="password" type="password" placeholder="password" className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-100 dark:border-gray-100 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500'/>
                {errors.password && touched.password ? (
                        <div style={{ color: 'red' }}>{errors.password} </div>
                    ) : null}
                </div>

                {status === 'loading' && <div>Loading...</div>}
                {status === 'failed' && <div>{error}</div>}
                <button type='submit' disabled={ isSubmitting || status === 'loading'} className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'>Login</button>
                <Link to='/register' >
                    <button className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'>Go To Registration Page</button>
                </Link>

                <Link to="/forgot-password" className="text-blue-600 mt-2 block">Forgot Password?</Link>


                {error && <div style={{ color: 'red' }}>{error}</div>}
                {lockMessage && <div style={{ color: 'red' }}>{lockMessage}</div>}

                {lastAttemptInfo && (
                    <div className="mt-4 p-4 bg-gray-100 rounded">
                        <h3 className="font-semibold mb-2">Last Login Attempt:</h3>
                        <p className={lastAttemptInfo.success ? "text-green-600" : "text-red-600"}>
                            {lastAttemptInfo.success 
                                ? `Last successful login: ${lastAttemptInfo.time}`
                                : `Last failed login attempt: ${lastAttemptInfo.time} (${lastAttemptInfo.reason})`
                            }
                        </p>
                    </div>
                )}



            </Form>
            )}

        </Formik>


          {/* {error && <div style={{ color: 'red' }}>{error}</div>}  */}
                <ul>
                {/* {storedUsers.map((user, index) => (
                    <li key={index}>
                        Welcome {user.name}
                         {user.email} - {user.mobileNumber} - {user.address} - {user.gender} - {user.birthdate}
                    </li>
                ))} */}
                </ul>
                {/* <button onClick={printStoredUsers}>Print Stored Users to Console</button> */}
        </div>

    )
}