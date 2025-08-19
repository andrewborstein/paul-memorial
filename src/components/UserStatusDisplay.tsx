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
  }, []);

  if (!isLoaded) {
    return null; // Don't render anything until client-side check is complete
  }

  if (!currentUser) {
    return null; // Don't show anything if not signed in
  }

  return (
    <div className="flex items-center gap-3">
      <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-md text-blue-700">
        <span className="font-medium">{currentUser.name}</span>
        <span className="text-blue-600 ml-2">({currentUser.email})</span>
      </div>
      <button
        type="button"
        onClick={onEditContactInfo}
        className="text-sm text-blue-600 hover:text-blue-800 underline"
      >
        Edit contact info
      </button>
    </div>
  );
}
