'use client';

import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import PageHeader from '@/components/PageHeader';
import MemoryMasonry from '@/components/MemoryMasonry';
import type { MemoryIndexItem } from '@/types/memory';

interface MemoriesPageClientProps {
  memories: MemoryIndexItem[];
}

export default function MemoriesPageClient({
  memories,
}: MemoriesPageClientProps) {
  return (
    <>
      <PageContainer>
        <PageHeader
          title="Memories"
          description="Read memories shared by friends and family."
        >
          <Link
            href="/memories/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap flex-shrink-0"
          >
            Share memory
          </Link>
        </PageHeader>

        {memories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No memories shared yet.</p>
            <Link
              href="/memories/new"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Be the first to share a memory
            </Link>
          </div>
        )}
      </PageContainer>

      {memories.length > 0 && (
        <div className="w-full px-2">
          <MemoryMasonry memories={memories} />
        </div>
      )}
    </>
  );
}
