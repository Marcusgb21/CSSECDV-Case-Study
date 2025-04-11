import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import userReducer from './features/user'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Login from './components/Login.jsx'
import Registration from './components/Registration.jsx'
import ForgotPassword from './components/ForgotPassword.jsx';
import Home from './components/Home.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import ProductManagerDashboard from './components/ProductManagerDashboard.jsx';
import CustomerDashboard from './components/CustomerDashboard.jsx';
import RoleBasedRoute from './components/RoleBasedRoute.jsx';


const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "register",
    element: <Registration />,
  },
  {
    path: "forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "admin-dashboard",
    element: (
      <RoleBasedRoute allowedRoles={['Website Administrator']}>
        <AdminDashboard />
      </RoleBasedRoute>
    ),
  },
  {
    path: "product-manager-dashboard",
    element: (
      <RoleBasedRoute allowedRoles={['Product Manager', 'Website Administrator']}>
        <ProductManagerDashboard />
      </RoleBasedRoute>
    ),
  },
  {
    path: "customer-dashboard",
    element: (
      <RoleBasedRoute allowedRoles={['Customer', 'Product Manager', 'Website Administrator']}>
        <CustomerDashboard />
      </RoleBasedRoute>
    ),
  }
]);

const store = configureStore({
    reducer:{
      user: userReducer,
    }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
      {/* <App /> */}
    </Provider>
  </React.StrictMode>,
)
