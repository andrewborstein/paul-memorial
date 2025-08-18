'use client';

import { useState } from 'react';
import { setSuperUser, isSuperUser, clearSuperUser, getCurrentUser } from '@/lib/user';
import PageContainer from '@/components/PageContainer';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuper, setIsSuper] = useState(isSuperUser());
  const currentUser = getCurrentUser();

  const handleSetSuperUser = () => {
    if (setSuperUser(password)) {
      setMessage('Super user mode activated!');
      setIsSuper(true);
      setPassword('');
    } else {
      setMessage('Invalid password');
    }
  };

  const handleClearSuperUser = () => {
    clearSuperUser();
    setMessage('Super user mode deactivated');
    setIsSuper(false);
  };

  return (
    <PageContainer>
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Admin Panel</h1>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-medium mb-4">Super User Management</h2>
          
          {currentUser && (
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Current User:</p>
              <p className="font-medium">{currentUser.name}</p>
              <p className="text-sm text-gray-500">{currentUser.email}</p>
            </div>
          )}
          
          {isSuper ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <span className="text-lg">✅</span>
                <span className="font-medium">Super user mode active</span>
              </div>
              <p className="text-sm text-gray-600">
                You can now edit and delete any memory on the site.
              </p>
              <button
                onClick={handleClearSuperUser}
                className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Deactivate Super User Mode
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Super User Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter super user password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSetSuperUser()}
                />
              </div>
              <button
                onClick={handleSetSuperUser}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Activate Super User Mode
              </button>
            </div>
          )}
          
          {message && (
            <div className={`mt-4 p-3 rounded-md text-sm ${
              message.includes('activated') || message.includes('deactivated')
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}
        </div>
        
        <div className="mt-6 text-center">
          <a href="/" className="text-blue-600 hover:text-blue-800 text-sm">
            ← Back to home
          </a>
        </div>
      </div>
    </PageContainer>
  );
}
