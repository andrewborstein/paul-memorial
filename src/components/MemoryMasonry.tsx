'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/user';
import ImageWithFallback from '@/components/ImageWithFallback';
import MemoryMetadata from '@/components/MemoryMetadata';

interface MemoryMasonryProps {
  memories: {
    id: string;
    title?: string;
    name?: string;
    email?: string;
    created_at: string;
    body?: string;
    cover_public_id?: string;
    photo_count: number;
  }[];
}

export default function MemoryMasonry({ memories }: MemoryMasonryProps) {
  const [userStates, setUserStates] = useState<Record<string, boolean>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [expandedStates, setExpandedStates] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    const currentUser = getCurrentUser();
    const states: Record<string, boolean> = {};

    memories.forEach((memory) => {
      states[memory.id] = currentUser?.email === memory.email;
    });

    setUserStates(states);
    setIsLoaded(true);
  }, [memories]);

  const displayTitle = (memory: any) => memory.title?.trim() || undefined;
  const bodyText = (memory: any) => memory.body || '';
  const needsTruncation = (memory: any) => bodyText(memory).length > 1000;
  const truncatedBody = (memory: any) => {
    const text = bodyText(memory);
    return text.length > 1000 ? text.substring(0, 1000).trim() + '...' : text;
  };

  const getCardClasses = (memoryId: string) => {
    const isCurrentUser = userStates[memoryId];
    return isLoaded && isCurrentUser
      ? 'block bg-blue-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 group hover:scale-[1.02]'
      : 'block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 group hover:scale-[1.02]';
  };

  const toggleExpanded = (memoryId: string) => {
    setExpandedStates((prev) => ({
      ...prev,
      [memoryId]: !prev[memoryId],
    }));
  };

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-3 2xl:columns-4 gap-6 space-y-6">
      {memories.map((memory) => (
        <div key={memory.id} className="break-inside-avoid mb-6">
          <Link
            href={`/memories/${memory.id}`}
            className={getCardClasses(memory.id)}
          >
            {/* Header: Author Name & Date */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-900 truncate">
                {memory.name || 'Anonymous'}
              </p>
              <MemoryMetadata
                date={memory.created_at}
                creatorEmail={memory.email || ''}
                creatorName={memory.name || ''}
              />
            </div>

            {/* Title */}
            {displayTitle(memory) && (
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                {displayTitle(memory)}
              </h3>
            )}

            {/* Content */}
            <div className="text-gray-700 text-sm mb-3">
              <p className="whitespace-pre-wrap">
                {expandedStates[memory.id]
                  ? bodyText(memory)
                  : truncatedBody(memory)}
              </p>
              {needsTruncation(memory) && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleExpanded(memory.id);
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium text-xs mt-2"
                >
                  {expandedStates[memory.id] ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>

            {/* Bottom Row: Photo Thumbnail */}
            {memory.cover_public_id && (
              <div className="flex items-center justify-end">
                <div className="w-24 h-24 rounded-lg overflow-hidden relative">
                  <ImageWithFallback
                    publicId={memory.cover_public_id}
                    alt="Memory preview"
                    className="w-full h-full object-cover"
                    width={96}
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
              </div>
            )}
          </Link>
        </div>
      ))}
    </div>
  );
}
