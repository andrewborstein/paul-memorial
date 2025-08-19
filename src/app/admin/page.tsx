'use client';

import { useState, useEffect } from 'react';
import {
  setSuperUser,
  isSuperUser,
  clearSuperUser,
  getCurrentUser,
  type UserInfo,
} from '@/lib/user';
import PageContainer from '@/components/PageContainer';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuper, setIsSuper] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [customJson, setCustomJson] = useState('');
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);

  useEffect(() => {
    // Only run on client side
    const user = getCurrentUser();
    const superUserStatus = isSuperUser();
    setCurrentUser(user);
    setIsSuper(superUserStatus);
    setIsLoaded(true);
  }, []);

  const handleSetSuperUser = async () => {
    const success = await setSuperUser(password);
    if (success) {
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

  const handleBulkCreate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/bulk-create', {
        method: 'POST',
      });
      const result = await response.json();
      setMessage(`Created ${result.count} test memories`);
    } catch (error) {
      setMessage('Error creating test data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm('Are you sure? This will delete ALL memories!')) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/bulk-delete', {
        method: 'DELETE',
      });
      const result = await response.json();
      setMessage(`Deleted ${result.count} memories`);
    } catch (error) {
      setMessage('Error deleting memories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomBulkCreate = async () => {
    if (!customJson.trim()) {
      setMessage('Please paste JSON data');
      return;
    }

    setIsCreatingCustom(true);
    try {
      const memories = JSON.parse(customJson);
      if (!Array.isArray(memories)) {
        setMessage('JSON must be an array of memory objects');
        return;
      }

      const response = await fetch('/api/admin/bulk-create-custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memories }),
      });

      const result = await response.json();
      if (result.success) {
        setMessage(`Created ${result.count} custom memories`);
        setCustomJson('');
      } else {
        setMessage(result.message || 'Error creating custom memories');
      }
    } catch (error) {
      setMessage('Invalid JSON format');
    } finally {
      setIsCreatingCustom(false);
    }
  };

  // Show loading state until client-side data is loaded
  if (!isLoaded) {
    return (
      <PageContainer>
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-semibold mb-6">Admin Panel</h1>
          <div className="animate-pulse">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

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
              <div className="flex items-center gap-2 text-red-600">
                <span className="text-lg">❌</span>
                <span className="font-medium">Super user mode inactive</span>
              </div>
              <p className="text-sm text-gray-600">
                Enter the super user password to activate admin features.
              </p>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter super user password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSetSuperUser}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Activate Super User Mode
              </button>
            </div>
          )}
        </div>

        {isSuper && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mt-6">
            <h2 className="text-lg font-medium mb-4">Bulk Data Management</h2>
            <p className="text-sm text-gray-600 mb-4">
              Create test data or clear all memories for testing.
            </p>

            <div className="space-y-3">
              <button
                onClick={handleBulkCreate}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create 32 Test Memories'}
              </button>

              <button
                onClick={handleBulkDelete}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Deleting...' : 'Delete ALL Memories'}
              </button>
            </div>
          </div>
        )}

        {isSuper && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mt-6">
            <h2 className="text-lg font-medium mb-4">Custom Bulk Create</h2>
            <p className="text-sm text-gray-600 mb-4">
              Paste JSON array of memory objects. Each memory should have: name,
              email, body, title (optional), photo_count, created_at (optional).
            </p>

            <div className="space-y-3">
              <textarea
                value={customJson}
                onChange={(e) => setCustomJson(e.target.value)}
                placeholder={`[
  {
    "name": "John Doe",
    "email": "john@example.com",
    "title": "My Memory",
    "body": "This is my memory about Paul...",
    "photo_count": 0,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
]`}
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />

              <button
                onClick={handleCustomBulkCreate}
                disabled={isCreatingCustom || !customJson.trim()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isCreatingCustom ? 'Creating...' : 'Create Custom Memories'}
              </button>
            </div>
          </div>
        )}

        {message && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-800">{message}</p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
