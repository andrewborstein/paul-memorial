'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/user';

interface MemoryMetadataProps {
  date: string;
  creatorEmail: string;
  creatorName: string;
}

export default function MemoryMetadata({ date, creatorEmail, creatorName }: MemoryMetadataProps) {
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setIsCurrentUser(currentUser?.email === creatorEmail);
    setIsLoaded(true);
  }, [creatorEmail]);

  if (!isLoaded) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
        <span>
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
    <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
      <span>
        {new Date(date).toLocaleDateString('en-US', {
          month: 'numeric',
          day: 'numeric',
          year: '2-digit',
        })}
      </span>
      <span>•</span>
      <span className="flex items-center gap-1">
        {isCurrentUser ? (
          <>
            <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs font-medium">
              You
            </span>
            <span>shared this</span>
          </>
        ) : (
          <span>Shared by {creatorName}</span>
        )}
      </span>
    </div>
  );
}
