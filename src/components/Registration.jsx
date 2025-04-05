import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { clearError, registerFailure,registerRequest,registerSuccess } from '../features/user';
import { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import { Link } from 'react-router-dom';
import bcrypt from 'bcryptjs';

export default function Registration(){

    const dispatch = useDispatch();
    const {status, error} = useSelector((state) => state.user);
    const [storedUsers, setStoredUsers] = useState([]);
    const mobileNumberRegex = /^(\+?\d{1,4}|\d{1,4})?(\s?\d{10})$/;

    useEffect(() => {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        setStoredUsers(users);
    }, []);

    const registrationSchema = Yup.object().shape({
        name: Yup.string()
        .min(2, 'Too Short!')
        .max(50, 'Too Long!')
        .required('Name is required'),
        mobileNumber: Yup.string().matches(mobileNumberRegex,'Invalid Mobile Number').required('Mobile Number is required'),
        email: Yup.string().email('Invalid email').required('Email is required'),
        address: Yup.string().
        min(2, 'Too Short!')
        .max(60, 'Too Long!')
        .required('Address is required'),
        gender: Yup.string().required('Gender is required'),
        password: Yup.string()
        .min(8, 'Password must be at least 8 characters long')
        .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
        .matches(/[A-Z]/, 'Password must contain at least one upper case letter')
        .matches(/\d/, 'Password must contain at least one number')
        .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
        birthdate: Yup.string().required('Birthday is required'), 
    });

    const printStoredUsers = () => {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        console.log(users);
    };

    const saltRounds = 10;
    

    return(
        <div>
            <h1 className='relative z-0 w-full mb-5 group text-center text-3xl'>Registration Page</h1>
        <Formik 
            initialValues={{
                name: '',
                mobileNumber: '',
                email: '',
                address: '',
                gender: '',
                password:'',
                birthdate:''
            }}
            validationSchema={registrationSchema}
            onSubmit={(values, {setSubmitting})=> {
                console.log(values)
                setSubmitting(false)

                dispatch(clearError());
                dispatch(registerRequest());

                setTimeout(() => {
                    try{
                        const users = JSON.parse(localStorage.getItem('users')) || [];
                        const userExists = users.some(user => user.email === values.email && user.mobileNumber === values.mobileNumber && user.address === values.address && user.gender === values.gender && user.birthdate === values.birthdate);

                        if(userExists){
                            throw new Error("All given information are already used...");
                        }

                        const salt = bcrypt.genSaltSync(saltRounds);
                        const hashedPassword = bcrypt.hashSync(values.password, salt);
                        const newUser = {
                                    ...values,
                                    password:hashedPassword
                                }

                        users.push(newUser);
                        localStorage.setItem('users', JSON.stringify(users));
                        setStoredUsers(users);

                        dispatch(registerSuccess(newUser));
                    }   catch (error){
                        dispatch(registerFailure(error.message))
                    }

                    setSubmitting(false);
                }, 1000);
            }}
        >
            {({ isSubmitting, errors, touched }) => (
            <Form className="max-w-md mx-auto">
                <div className="relative z-0 w-full mb-5 group">
                    <Field name="name" type="text" placeholder=" " className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-black dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" />
                    <label htmlFor='name' className='peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'>Name:</label>
                    {errors.name && touched.name ? (
                        <div style={{ color: 'red' }}>{errors.name} </div>
                    ) : null}
                </div>
                <div className='relative z-0 w-full mb-5 group'>
                    <Field name= "mobileNumber" type="text" placeholder=" " className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-black dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"/>
                    <label htmlFor='mobileNumber' className='peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'>Mobile Number#: </label>
                    {errors.mobileNumber && touched.mobileNumber ? (
                        <div style={{ color: 'red' }}>{errors.mobileNumber} </div>
                    ) : null}
                </div>
                <div className='relative z-0 w-full mb-5 group'>
                    <Field name="email" type="text" placeholder=" " className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-black dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"/>
                    <label htmlFor='email' className='peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'>Email: </label>
                    {errors.email && touched.email ? (
                        <div style={{ color: 'red' }}>{errors.email} </div>
                    ) : null}
                </div>
                <div className='relative z-0 w-full mb-5 group'>
                    <Field name="address" type="text" placeholder=" " className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-black dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"/>
                    <label htmlFor='address' className='peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'>Address: </label>
                    {errors.address && touched.address ? (
                        <div style={{ color: 'red' }}>{errors.address} </div>
                    ) : null}
                </div>
                <div className='relative z-0 w-full mb-5 group'>
                    <label htmlFor='gender'>Gender: </label>
                    <Field name="gender" as="select">
                        <option value="" label='Select Gender: '/>
                        <option value="male" label='Male'/>
                        <option value="female" label='Female'/>
                        <option value="other" label='other'/>
                    </Field>
                    {errors.gender && touched.gender ?(
                        <div style={{ color: 'red' }}>{errors.gender} </div>
                    ) : null}
                </div>
                <div className='relative z-0 w-full mb-5 group'>
                    <Field name="password" type="password" placeholder=" " className = "block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-black dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"/>
                    <label htmlFor='password'className='peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'>Password: </label>
                    {errors.password && touched.password ?(
                        <div style={{ color: 'red' }} >{errors.password} </div>
                    ) : null}
                </div>
                <div className='relative z-0 w-full mb-5 group'>
                    <label htmlFor='birthdate'>Birthdate: </label>
                    <Field name="birthdate" type="date" placeholder="Birthdate"/>
                    {errors.birthdate && touched.birthdate ?(
                        <div style={{ color: 'red' }} >{errors.birthdate} </div>
                    ) : null}
                </div>
                <button type='submit' disabled={isSubmitting || status === 'loading'} className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800' >Register</button>
                <Link to='/login'>
                <button className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'>Go To Login Page</button>    
                </Link>
                {error && <div style={{ color: 'red' }}>{error}</div>}
            </Form>
            )}
        </Formik>
        {/* {error && <div style={{ color: 'red' }}>{error}</div>} */}
        
        {/* <div className='max-w-md ml-auto'>
        <Link to='/login'>
            <button className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'>Go To Login Page</button>
        </Link>
        </div> */}
        
        {/* <h2>Registered Users</h2>
                <ul>
                    {storedUsers.map((user, index) => (
                        <li key={index}>
                            {user.name} - {user.email} - {user.mobileNumber} - {user.address} - {user.gender} - {user.birthdate} - {user.password} 
                        </li>
                    ))}
                </ul>
                <button onClick={printStoredUsers}>Print Stored Users to Console</button> */}
        </div>
        
        
        
    )
}