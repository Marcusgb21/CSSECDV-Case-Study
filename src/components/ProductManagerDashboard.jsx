import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProductManagerDashboard = () => {
  const { loggedInUser } = useSelector((state) => state.user);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Product Manager Dashboard</h1>
      
      <div className="mb-6">
        <Link to="/" className="text-blue-600 hover:underline">Back to Home</Link>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, {loggedInUser?.name}</h2>
        <p className="mb-2">Role: {loggedInUser?.role}</p>
        <p className="mb-4">This is the Product Manager dashboard where you can manage products and inventory.</p>
        
        <div className="bg-yellow-100 p-3 rounded">
          <p className="text-yellow-800">
            This is a placeholder for the Product Manager functionality. In a real application, 
            you would have access to product management features here.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Product Management</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>View and edit product details</li>
            <li>Manage product inventory</li>
            <li>Set product pricing</li>
            <li>Create product promotions</li>
          </ul>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Analytics</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>View sales reports</li>
            <li>Monitor product performance</li>
            <li>Track inventory levels</li>
            <li>Analyze customer feedback</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProductManagerDashboard;
