'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser, isSignedIn } from '@/lib/user';

interface UserStatusDisplayProps {
  name: string;
  email: string;
  onEditContactInfo: () => void;
}

export default function UserStatusDisplay({ 
  name, 
  email, 
  onEditContactInfo 
}: UserStatusDisplayProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);

  useEffect(() => {
    setIsUserSignedIn(isSignedIn());
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return null; // Don't render anything until client-side check is complete
  }

  if (!isUserSignedIn) {
    return null; // Don't show anything if not signed in
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Signed in as
      </label>
      <div className="flex items-center gap-3">
        <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-md text-blue-700">
          <span className="font-medium">{name}</span>
          <span className="text-blue-600 ml-2">({email})</span>
        </div>
        <button
          type="button"
          onClick={onEditContactInfo}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Edit contact info
        </button>
      </div>
    </div>
  );
}
