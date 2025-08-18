import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import PageHeader from '@/components/PageHeader';
import { serverFetch } from '@/lib/utils';
import ImageWithFallback from '@/components/ImageWithFallback';
import type { MemoryIndexItem } from '@/types/memory';

// Make this page dynamic to avoid build-time API calls
export const dynamic = 'force-dynamic';

async function getMemories(): Promise<MemoryIndexItem[]> {
  const res = await serverFetch('/api/memories', {
    next: { revalidate: 60 },
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function MemoriesPage() {
  try {
    const memories = await getMemories();

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

              return (
                <Link
                  key={memory.id}
                  href={`/memories/${memory.id}`}
                  className="block bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow group"
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
                      <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                        <span>{new Date(memory.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}</span>
                      </div>
                    </div>

                    {/* Photo Thumbnail */}
                    {memory.cover_url && (
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 rounded-lg overflow-hidden relative">
                          <ImageWithFallback
                            src={memory.cover_url}
                            alt="Memory preview"
                            className="w-full h-full object-cover"
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
