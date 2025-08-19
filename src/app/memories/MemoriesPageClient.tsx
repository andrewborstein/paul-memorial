'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import PageHeader from '@/components/PageHeader';
import MemoryCard from '@/components/MemoryCard';
import MemoryMasonry from '@/components/MemoryMasonry';
import ViewToggle from '@/components/ViewToggle';
import type { MemoryIndexItem } from '@/types/memory';

interface MemoriesPageClientProps {
  memories: MemoryIndexItem[];
}

const VIEW_STORAGE_KEY = 'paul-memorial-view-preference';

export default function MemoriesPageClient({
  memories,
}: MemoriesPageClientProps) {
  const [view, setView] = useState<'list' | 'masonry'>('masonry');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load view preference from localStorage on mount
  useEffect(() => {
    const savedView = localStorage.getItem(VIEW_STORAGE_KEY) as
      | 'list'
      | 'masonry';
    if (savedView && (savedView === 'list' || savedView === 'masonry')) {
      setView(savedView);
    }
    setIsLoaded(true);
  }, []);

  const handleViewChange = (newView: 'list' | 'masonry') => {
    setView(newView);
    localStorage.setItem(VIEW_STORAGE_KEY, newView);
  };

  // Don't render until we've loaded the saved preference
  if (!isLoaded) {
    return (
      <PageContainer>
        <div className="flex items-center justify-between mb-8 gap-4">
          <div className="min-w-0 flex-1">
            <PageHeader
              title="Memories"
              description="Read memories shared by friends and family."
            />
          </div>
          <div className="flex items-center gap-4">
            <ViewToggle view="list" onViewChange={() => {}} />
            <Link
              href="/memories/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap flex-shrink-0"
            >
              Share memory
            </Link>
          </div>
        </div>
        <div className="animate-pulse">
          <div className="space-y-4 sm:space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <>
      <PageContainer>
        <div className="flex items-center justify-between mb-8 gap-4">
          <div className="min-w-0 flex-1">
            <PageHeader
              title="Memories"
              description="Read memories shared by friends and family."
            />
          </div>
          <div className="flex items-center gap-4">
            <ViewToggle view={view} onViewChange={handleViewChange} />
            <Link
              href="/memories/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap flex-shrink-0"
            >
              Share memory
            </Link>
          </div>
        </div>

        {memories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No memories shared yet.</p>
            <Link
              href="/memories/new"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Be the first to share a memory
            </Link>
          </div>
        ) : view === 'list' ? (
          <div className="space-y-4 sm:space-y-6">
            {memories.map((memory) => (
              <MemoryCard key={memory.id} memory={memory} />
            ))}
          </div>
        ) : null}
      </PageContainer>

      {view === 'masonry' && memories.length > 0 && (
        <div className="w-full px-2">
          <MemoryMasonry memories={memories} />
        </div>
      )}
    </>
  );
}
