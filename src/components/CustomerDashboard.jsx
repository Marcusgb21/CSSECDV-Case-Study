import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const CustomerDashboard = () => {
  const { loggedInUser } = useSelector((state) => state.user);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Customer Dashboard</h1>
      
      <div className="mb-6">
        <Link to="/" className="text-blue-600 hover:underline">Back to Home</Link>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, {loggedInUser?.name}</h2>
        <p className="mb-2">Role: {loggedInUser?.role}</p>
        <p className="mb-4">This is your personal customer dashboard where you can manage your account and orders.</p>
        
        <div className="bg-blue-100 p-3 rounded">
          <p className="text-blue-800">
            This is a placeholder for the Customer dashboard functionality. In a real application, 
            you would have access to your order history, account settings, and more.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">My Account</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>View and edit profile information</li>
            <li>Change password</li>
            <li>Manage payment methods</li>
            <li>Update shipping addresses</li>
          </ul>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">My Orders</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>View order history</li>
            <li>Track current orders</li>
            <li>Request returns or exchanges</li>
            <li>View purchase receipts</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
