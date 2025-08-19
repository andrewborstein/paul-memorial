'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/user';

interface MemoryMetadataProps {
  date: string;
  creatorEmail: string;
  creatorName: string;
}

export default function MemoryMetadata({
  date,
  creatorEmail,
  creatorName,
}: MemoryMetadataProps) {
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setIsCurrentUser(currentUser?.email === creatorEmail);
    setIsLoaded(true);
  }, [creatorEmail]);

  if (!isLoaded) {
    return (
      <div className="flex items-center gap-2 text-xs flex-wrap">
        <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-xs font-medium">
          {new Date(date).toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: '2-digit',
          })}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs flex-wrap">
      <span
        className={`px-1.5 py-0.5 rounded text-xs font-medium ${
          isCurrentUser
            ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-100 text-gray-700'
        }`}
      >
        {creatorName},{' '}
        {new Date(date).toLocaleDateString('en-US', {
          month: 'numeric',
          day: 'numeric',
          year: '2-digit',
        })}
      </span>
    </div>
  );
}
