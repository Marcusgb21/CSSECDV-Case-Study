import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AccessDenied from './AccessDenied';

const SecurityLogs = () => {
  const { hasRole } = useAuth();
  const [securityLogs, setSecurityLogs] = useState([]);
  const [accessLogs, setAccessLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('security');
  const [filter, setFilter] = useState('');
  
  // Only administrators should be able to view security logs
  const isAdmin = hasRole('Website Administrator');
  
  useEffect(() => {
    if (isAdmin) {
      try {
        // Load security logs
        const storedSecurityLogs = JSON.parse(localStorage.getItem('securityLogs')) || [];
        setSecurityLogs(storedSecurityLogs.reverse()); // Show newest first
        
        // Load access logs
        const storedAccessLogs = JSON.parse(localStorage.getItem('accessLogs')) || [];
        setAccessLogs(storedAccessLogs.reverse()); // Show newest first
      } catch (error) {
        console.error('Error loading security logs:', error);
      }
    }
  }, [isAdmin]);
  
  // Filter logs based on search term
  const filteredSecurityLogs = securityLogs.filter(log => 
    JSON.stringify(log).toLowerCase().includes(filter.toLowerCase())
  );
  
  const filteredAccessLogs = accessLogs.filter(log => 
    JSON.stringify(log).toLowerCase().includes(filter.toLowerCase())
  );
  
  // Format date for display
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return dateString;
    }
  };
  
  if (!isAdmin) {
    return <AccessDenied reason="role" message="Only administrators can view security logs." />;
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Security Logs</h1>
      
      <div className="mb-6">
        <Link to="/" className="text-blue-600 hover:underline">Back to Home</Link>
      </div>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Filter logs..."
          className="w-full p-2 border rounded"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      
      <div className="mb-4 flex border-b">
        <button
          className={`py-2 px-4 ${activeTab === 'security' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('security')}
        >
          Security Events ({filteredSecurityLogs.length})
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'access' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('access')}
        >
          Access Attempts ({filteredAccessLogs.length})
        </button>
      </div>
      
      {activeTab === 'security' ? (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSecurityLogs.length > 0 ? (
                filteredSecurityLogs.map((log, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {log.eventType}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <pre className="whitespace-pre-wrap font-mono text-xs bg-gray-100 p-2 rounded">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                    No security logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Path</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAccessLogs.length > 0 ? (
                filteredAccessLogs.map((log, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.path}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${log.success ? 'text-green-600' : 'text-red-600'}`}>
                      {log.success ? 'Success' : 'Denied'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {log.reason}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    No access logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Security Information</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                These logs contain sensitive security information. They should only be accessible to administrators.
                The system is configured to "fail securely" - when errors occur in authorization checks, access is denied by default.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityLogs;
