'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser, setCurrentUser, type UserInfo } from '@/lib/user';
import PageContainer from '@/components/PageContainer';
import PageHeader from '@/components/PageHeader';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [currentUser, setCurrentUserState] = useState<UserInfo | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [name, setName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Only run on client side
    const user = getCurrentUser();
    setCurrentUserState(user);
    setIsLoaded(true);

    if (user) {
      setName(user.name);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && !currentUser) {
      router.push('/');
      return;
    }
  }, [currentUser, router, isLoaded]);

  useEffect(() => {
    const handleUserUpdate = () => {
      const user = getCurrentUser();
      setCurrentUserState(user);
      if (user) {
        setName(user.name);
      }
    };

    window.addEventListener('userUpdated', handleUserUpdate);
    return () => window.removeEventListener('userUpdated', handleUserUpdate);
  }, []);

  const handleSave = async () => {
    if (!currentUser || !name.trim()) return;

    setIsSaving(true);
    try {
      // Update the user in localStorage
      setCurrentUser(currentUser.email, name.trim());
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      setMessage('Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setName(currentUser?.name || '');
    setIsEditing(false);
    setMessage('');
  };

  // Don't render anything until client-side check is complete
  if (!isLoaded) {
    return null;
  }

  if (!currentUser) {
    return null;
  }

  return (
    <PageContainer>
      <PageHeader
        title="Profile Settings"
        description="Manage your account information"
      />

      <div className="max-w-md mx-auto">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-blue-600 text-white text-xl font-medium flex items-center justify-center">
              {currentUser.name
                .split(' ')
                .map((word) => word.charAt(0))
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {currentUser.name}
              </h2>
              <p className="text-sm text-gray-500">{currentUser.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your name"
                />
              ) : (
                <p className="text-gray-900">{currentUser.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <p className="text-gray-500">{currentUser.email}</p>
              <p className="text-xs text-gray-400 mt-1">
                Email address cannot be changed
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Member Since
              </label>
              <p className="text-gray-500">
                {new Date(currentUser.signedInAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            {message && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-blue-800 text-sm">{message}</p>
              </div>
            )}

            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !name.trim()}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
