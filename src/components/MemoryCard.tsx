'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/user';
import ImageWithFallback from '@/components/ImageWithFallback';
import MemoryMetadata from '@/components/MemoryMetadata';

interface MemoryCardProps {
  memory: {
    id: string;
    title?: string;
    name?: string;
    email?: string;
    date: string;
    body?: string;
    cover_public_id?: string;
    photo_count: number;
  };
}

export default function MemoryCard({ memory }: MemoryCardProps) {
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setIsCurrentUser(currentUser?.email === memory.email);
    setIsLoaded(true);
  }, [memory.email]);

  const displayTitle = memory.title || (isCurrentUser ? 'You' : memory.name || 'Unknown');
  const bodyText = memory.body || '';
  const truncatedBody = bodyText.length > 200 
    ? bodyText.substring(0, 200).trim() + '...'
    : bodyText;
  const needsTruncation = bodyText.length > 200;

  const cardClasses = isLoaded && isCurrentUser
    ? "block bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow group"
    : "block bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow group";

  return (
    <Link
      key={memory.id}
      href={`/memories/${memory.id}`}
      className={cardClasses}
    >
      <div className="flex gap-6">
        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <header className="mb-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
              {displayTitle}
            </h2>
          </header>

          {/* Memory Body */}
          <div className="text-gray-700 mb-3">
            <p className="whitespace-pre-wrap">{truncatedBody}</p>
            {needsTruncation && (
              <span className="text-blue-600 group-hover:text-blue-800 font-medium text-sm mt-2 inline-block">
                Read more
              </span>
            )}
          </div>

          {/* Metadata */}
          <MemoryMetadata
            date={memory.date}
            creatorEmail={memory.email || ''}
            creatorName={memory.name || ''}
          />
        </div>

        {/* Photo Thumbnail */}
        {memory.cover_public_id && (
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-lg overflow-hidden relative">
              <ImageWithFallback
                publicId={memory.cover_public_id}
                alt="Memory preview"
                className="w-full h-full object-cover"
                width={96}
                quality="auto"
              />
              {memory.photo_count > 1 && (
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    +{memory.photo_count - 1}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
