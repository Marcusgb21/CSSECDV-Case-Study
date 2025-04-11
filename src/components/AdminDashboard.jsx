import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [message, setMessage] = useState('');
  const { roles, loggedInUser } = useSelector((state) => state.user);

  useEffect(() => {
    // Load users from localStorage
    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
    setUsers(storedUsers);
  }, []);

  const handleRoleChange = (e) => {
    setNewRole(e.target.value);
  };

  const updateUserRole = () => {
    if (!selectedUser || !newRole) {
      setMessage('Please select a user and a role');
      return;
    }

    // Update user role in the local state
    const updatedUsers = users.map(user => {
      if (user.email === selectedUser.email) {
        return { ...user, role: newRole };
      }
      return user;
    });

    // Save updated users to localStorage
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    setMessage(`Role updated for ${selectedUser.name} to ${newRole}`);

    // Clear selection
    setSelectedUser(null);
    setNewRole('');

    // Log the role change
    const roleChangeLog = {
      adminEmail: loggedInUser.email,
      targetUserEmail: selectedUser.email,
      oldRole: selectedUser.role,
      newRole: newRole,
      timestamp: new Date().toISOString()
    };

    const roleLogs = JSON.parse(localStorage.getItem('roleLogs')) || [];
    roleLogs.push(roleChangeLog);
    localStorage.setItem('roleLogs', JSON.stringify(roleLogs));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <div className="mb-6 flex space-x-4">
        <Link to="/" className="text-blue-600 hover:underline">Back to Home</Link>
        <Link to="/security-logs" className="text-red-600 hover:underline">View Security Logs</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>

          <div className="mb-4">
            <h3 className="font-medium mb-2">Select User:</h3>
            <select
              className="w-full p-2 border rounded"
              value={selectedUser ? selectedUser.email : ''}
              onChange={(e) => {
                const email = e.target.value;
                const user = users.find(u => u.email === email);
                setSelectedUser(user);
                setNewRole(user ? user.role : '');
              }}
            >
              <option value="">-- Select User --</option>
              {users.map(user => (
                <option key={user.email} value={user.email}>
                  {user.name} ({user.email}) - Current Role: {user.role || 'None'}
                </option>
              ))}
            </select>
          </div>

          {selectedUser && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">Change Role:</h3>
              <select
                className="w-full p-2 border rounded mb-4"
                value={newRole}
                onChange={handleRoleChange}
              >
                <option value="">-- Select Role --</option>
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>

              <button
                onClick={updateUserRole}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Update Role
              </button>
            </div>
          )}

          {message && (
            <div className={`mt-4 p-2 rounded ${message.includes('error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">User Statistics</h2>
          <div className="space-y-2">
            <p>Total Users: {users.length}</p>
            <p>Administrators: {users.filter(u => u.role === 'Website Administrator').length}</p>
            <p>Product Managers: {users.filter(u => u.role === 'Product Manager').length}</p>
            <p>Customers: {users.filter(u => u.role === 'Customer').length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
