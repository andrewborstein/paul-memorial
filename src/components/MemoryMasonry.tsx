'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/user';
import ImageWithFallback from '@/components/ImageWithFallback';
import MemoryMetadata from '@/components/MemoryMetadata';
import Masonry from 'masonry-layout';

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
  const masonryRef = useRef<HTMLDivElement>(null);
  const masonryInstance = useRef<any | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    const states: Record<string, boolean> = {};

    memories.forEach((memory) => {
      states[memory.id] = currentUser?.email === memory.email;
    });

    setUserStates(states);
    setIsLoaded(true);
  }, [memories]);

  // Initialize Masonry
  useEffect(() => {
    if (masonryRef.current && memories.length > 0) {
      // Destroy existing instance if it exists
      if (masonryInstance.current) {
        try {
          masonryInstance.current.destroy();
        } catch (e) {
          // Ignore destroy errors
        }
        masonryInstance.current = null;
      }

      // Initialize new Masonry instance
      try {
        const masonry = new Masonry(masonryRef.current, {
          itemSelector: '.memory-card',
          columnWidth: '.memory-card',
          percentPosition: true,
          gutter: 0, // Using padding instead
          fitWidth: false,
        });
        masonryInstance.current = masonry;

        // Trigger layout after initialization
        setTimeout(() => {
          if (masonryInstance.current) {
            masonryInstance.current.layout();
          }
        }, 100);
      } catch (e) {
        console.error('Failed to initialize masonry:', e);
      }
    }

    // Cleanup on unmount
    return () => {
      if (masonryInstance.current) {
        try {
          masonryInstance.current.destroy();
        } catch (e) {
          // Ignore destroy errors
        }
        masonryInstance.current = null;
      }
    };
  }, [memories, expandedStates]);

  // Relayout when content changes (like when "Read more" is clicked)
  useEffect(() => {
    if (masonryInstance.current) {
      try {
        masonryInstance.current.layout();
      } catch (e) {
        // Ignore layout errors
      }
    }
  }, [expandedStates]);

  // Handle window resize for responsive layout
  useEffect(() => {
    const handleResize = () => {
      if (masonryInstance.current) {
        try {
          masonryInstance.current.layout();
        } catch (e) {
          // Ignore layout errors
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <div ref={masonryRef} className="w-full masonry-container">
      {memories.map((memory) => (
        <div
          key={memory.id}
          className="memory-card w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 mb-6 px-3"
        >
          <Link
            href={`/memories/${memory.id}`}
            className={getCardClasses(memory.id)}
          >
            {/* Header: Text items on left, thumbnail on right */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                {/* Name */}
                <p className="text-sm font-medium text-gray-900 mb-2">
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
            {displayTitle(memory) && (
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-3">
                {displayTitle(memory)}
              </h3>
            )}

            {/* Content */}
            <div className="text-gray-700 text-sm select-text relative z-10">
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
          </Link>
        </div>
      ))}
    </div>
  );
}
