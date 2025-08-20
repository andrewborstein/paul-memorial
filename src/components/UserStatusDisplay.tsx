'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser, isSignedIn, type UserInfo } from '@/lib/user';

interface UserStatusDisplayProps {
  onEditContactInfo: () => void;
}

export default function UserStatusDisplay({
  onEditContactInfo,
}: UserStatusDisplayProps) {
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    setIsLoaded(true);

    // Listen for user updates
    const handleUserUpdate = () => {
      const updatedUser = getCurrentUser();
      setCurrentUser(updatedUser);
    };

    window.addEventListener('userUpdated', handleUserUpdate);

    return () => {
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, []);

  if (!isLoaded) {
    return null; // Don't render anything until client-side check is complete
  }

  if (!currentUser) {
    return null; // Don't show anything if not signed in
  }

  return (
    <div className="flex items-center gap-3">
      <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-md text-blue-700 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="font-medium">{currentUser.name}</span>
          <span className="text-blue-600 text-sm">{currentUser.email}</span>
        </div>
        <div className="ml-4">
          <button
            type="button"
            onClick={onEditContactInfo}
            className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-100 transition-colors"
            title="Edit contact info"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
