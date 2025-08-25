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
    created_at: string;
    body?: string;
    cover_public_id?: string;
    photo_count: number;
  };
}

export default function MemoryCard({ memory }: MemoryCardProps) {
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  console.log('MemoryCard render:', {
    id: memory.id,
    photo_count: memory.photo_count,
    cover_public_id: memory.cover_public_id,
    title: memory.title,
    name: memory.name,
  });

  useEffect(() => {
    const currentUser = getCurrentUser();
    setIsCurrentUser(currentUser?.email === memory.email);
    setIsLoaded(true);
  }, [memory.email]);

  // Only show title if it's explicitly set and not empty
  // Only show title if it's explicitly set and not empty
  const displayTitle = memory.title?.trim() || undefined;
  const bodyText = memory.body || '';
  const needsTruncation = bodyText.length > 1000;
  const truncatedBody =
    bodyText.length > 1000
      ? bodyText.substring(0, 1000).trim() + '...'
      : bodyText;

  const cardClasses =
    isLoaded && isCurrentUser
      ? 'block bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow group'
      : 'block bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow group';

  return (
    <Link
      key={memory.id}
      href={`/memories/${memory.id}`}
      className={cardClasses}
    >
      {/* Header: Text items on left, thumbnail on right */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          {/* Name */}
          <p className="text-sm font-bold text-gray-900 mb-2">
            {memory.name || 'Anonymous'}
          </p>

          {/* Date */}
          <div className="mb-2">
            <MemoryMetadata
              date={memory.created_at}
              creatorEmail={memory.email || ''}
              creatorName={memory.name || ''}
            />
          </div>
        </div>

        {/* Thumbnail */}
        {memory.cover_public_id && (
          <div className="w-12 h-12 rounded-lg overflow-hidden relative flex-shrink-0 ml-4">
            <ImageWithFallback
              publicId={memory.cover_public_id}
              alt="Memory preview"
              className="w-full h-full object-cover"
              width={48}
              quality="auto"
            />
            {memory.photo_count > 1 && (
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-10">
                <span className="text-white text-xs font-medium">
                  +{memory.photo_count - 1}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 mb-3"></div>

      {/* Title */}
      {displayTitle && (
        <h2 className="text-md text-gray-900 group-hover:text-blue-600 transition-colors mb-3">
          {displayTitle}
        </h2>
      )}

      {/* Memory Body */}
      <div className="text-gray-700 select-text relative z-10 space-y-4">
        <p className="whitespace-pre-wrap">
          {isExpanded ? bodyText : truncatedBody}
        </p>
        {needsTruncation && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="link underline"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>
    </Link>
  );
}
