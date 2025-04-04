import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { loginRequest, loginSuccess, loginFailure, clearError } from '../features/user';
import { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import { Link } from 'react-router-dom';

export default function Login(){
    const dispatch = useDispatch();
    const [storedUsers, setStoredUsers] = useState([]);
    const {status, error, loggedInUser} = useSelector((state) => state.user);
    const [currentUser, setCurrentUser] = useState(null);

    const mobileNumberRegex = /^(\+?\d{1,4}|\d{1,4})?(\s?\d{10})$/;

    useEffect(() => {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        setCurrentUser(users[users.length - 1] || null);
    }, []);

    const printStoredUsers = (e) => {
        e.preventDefault()
        const users = JSON.parse(localStorage.getItem('users')) || [];
        console.log(users);
    };

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

            try{
                const users = JSON.parse(localStorage.getItem('users')) || []
                const user = users.find(u => ((u.email === values.emailOrMobile || u.mobileNumber === values.emailOrMobile)
            ))

            if(!user){
                throw new Error('User not found! Please register');
            }

            const decrypt = CryptoJS.AES.decrypt(user.password, 'your-secret-key');
            const decryptedPassword = decrypt.toString(CryptoJS.enc.Utf8);

            if (decryptedPassword !== values.password){
                throw new Error('Invalid login credentials');
            }

            // if (decryptedPassword !== values.password){
            //     throw new Error('Invalid Login Credentials... Please try again');
            // }
            // setStoredUsers(users);
        //    setCurrentUser(user)

            dispatch(loginSuccess(user));
            } catch(error){
                dispatch(loginFailure(error.message));
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
                
                {error && <div style={{ color: 'red' }}>{error}</div>}
                {loggedInUser && (
                    <div>
                        <h2 className='relative z-0 w-full mb-5 group text-center text-3xl'>Welcome <span className="text-blue-500">{loggedInUser.name}</span></h2>
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