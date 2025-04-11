import React from 'react'
import ReactDOM from 'react-dom/client'
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
import ChangePassword from './components/ChangePassword.jsx';
import SecurityLogs from './components/SecurityLogs.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import AuthGuard from './components/AuthGuard.jsx';
import AccessDenied from './components/AccessDenied.jsx';


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
      <AuthGuard requiredRoles={['Website Administrator']}>
        <AdminDashboard />
      </AuthGuard>
    ),
  },
  {
    path: "product-manager-dashboard",
    element: (
      <AuthGuard requiredRoles={['Product Manager', 'Website Administrator']}>
        <ProductManagerDashboard />
      </AuthGuard>
    ),
  },
  {
    path: "customer-dashboard",
    element: (
      <AuthGuard requiredRoles={['Customer', 'Product Manager', 'Website Administrator']}>
        <CustomerDashboard />
      </AuthGuard>
    ),
  },
  {
    path: "change-password",
    element: (
      <AuthGuard requiredRoles={['Customer', 'Product Manager', 'Website Administrator']}>
        <ChangePassword />
      </AuthGuard>
    ),
  },
  {
    path: "security-logs",
    element: (
      <AuthGuard requiredRoles={['Website Administrator']}>
        <SecurityLogs />
      </AuthGuard>
    ),
  },
  {
    path: "access-denied",
    element: <AccessDenied />,
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
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </Provider>
  </React.StrictMode>,
)
