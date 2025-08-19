import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import PageHeader from '@/components/PageHeader';
import { serverFetch } from '@/lib/utils';
import MemoryCard from '@/components/MemoryCard';
import type { MemoryIndexItem } from '@/types/memory';

// Force dynamic rendering and disable all caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function getMemories(searchParams?: {
  fresh?: string;
}): Promise<MemoryIndexItem[]> {
  const fresh = searchParams?.fresh === '1';
  const url = fresh ? '/api/memories?fresh=1' : '/api/memories';

  const res = await serverFetch(url, {
    cache: fresh ? 'no-store' : 'default',
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function MemoriesPage({
  searchParams,
}: {
  searchParams?: Promise<{ fresh?: string }>;
}) {
  try {
    const params = await searchParams;
    const memories = await getMemories(params);

    return (
      <PageContainer>
        <div className="flex items-center justify-between mb-8 gap-4">
          <div className="min-w-0 flex-1">
            <PageHeader
              title="Memories"
              description="Read memories shared by friends and family."
            />
          </div>
          <Link
            href="/memories/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap flex-shrink-0"
          >
            Share memory
          </Link>
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
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {memories.map((memory) => {
              const displayTitle = memory.title || memory.name || '';
              const bodyText = memory.body || '';
              const truncatedBody =
                bodyText.length > 200
                  ? bodyText.substring(0, 200).trim() + '...'
                  : bodyText;
              const needsTruncation = bodyText.length > 200;

              return <MemoryCard key={memory.id} memory={memory} />;
            })}
          </div>
        )}
      </PageContainer>
    );
  } catch (error) {
    console.error('Error loading memories page:', error);
    return (
      <PageContainer>
        <div className="flex items-center justify-between mb-8 gap-4">
          <div className="min-w-0 flex-1">
            <PageHeader
              title="Memories"
              description="Read memories shared by friends and family."
            />
          </div>
          <Link
            href="/memories/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap flex-shrink-0"
          >
            Share memory
          </Link>
        </div>

        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            Unable to load memories at this time.
          </p>
          <Link
            href="/memories/new"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Be the first to share a memory
          </Link>
        </div>
      </PageContainer>
    );
  }
}
