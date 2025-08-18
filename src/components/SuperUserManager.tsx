'use client';

import { useState } from 'react';
import { setSuperUser, isSuperUser, clearSuperUser } from '@/lib/user';

export default function SuperUserManager() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuper, setIsSuper] = useState(isSuperUser());

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
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg p-4 shadow-lg max-w-sm">
      <h3 className="text-sm font-semibold mb-2">Super User Mode</h3>
      
      {isSuper ? (
        <div className="space-y-2">
          <p className="text-xs text-green-600">✅ Super user active</p>
          <button
            onClick={handleClearSuperUser}
            className="w-full px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
          >
            Deactivate
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter super user password"
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
            onKeyPress={(e) => e.key === 'Enter' && handleSetSuperUser()}
          />
          <button
            onClick={handleSetSuperUser}
            className="w-full px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          >
            Activate
          </button>
        </div>
      )}
      
      {message && (
        <p className="text-xs text-gray-600 mt-2">{message}</p>
      )}
    </div>
  );
}
