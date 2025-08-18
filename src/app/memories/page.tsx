import Link from 'next/link';
import { cldUrl } from '@/lib/cloudinary';
import PageContainer from '@/components/PageContainer';
import PageHeader from '@/components/PageHeader';
import type { MemoryIndexItem, MemoryDetail } from '@/types/memory';

// Make this page dynamic to avoid build-time API calls
export const dynamic = 'force-dynamic';

async function getMemories(): Promise<MemoryIndexItem[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/memories`,
    {
      next: { revalidate: 60 },
    }
  );
  if (!res.ok) return [];
  return res.json();
}

async function getMemoryDetail(id: string): Promise<MemoryDetail | null> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/memory/${id}`,
    {
      next: { revalidate: 60 },
    }
  );
  if (!res.ok) return null;
  return res.json();
}

export default async function MemoriesPage() {
  const memories = await getMemories();

  // Get full details for each memory to access body text
  const memoriesWithDetails = await Promise.all(
    memories.map(async (memory) => {
      const detail = await getMemoryDetail(memory.id);
      return {
        ...memory,
        body: detail?.body || '',
        name: detail?.name || '',
      };
    })
  );

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
          {memoriesWithDetails.map((memory) => {
            const displayTitle = memory.title || memory.name;
            const truncatedBody =
              memory.body.length > 200
                ? memory.body.substring(0, 200).trim() + '...'
                : memory.body;
            const needsTruncation = memory.body.length > 200;

            return (
              <article
                key={memory.id}
                className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-6">
                  {/* Text Content */}
                  <div className="flex-1 min-w-0">
                    <header className="mb-3">
                      <h2 className="text-lg font-semibold text-gray-900 mb-1">
                        <Link
                          href={`/memories/${memory.id}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {displayTitle}
                        </Link>
                      </h2>
                    </header>

                    {/* Memory Body */}
                    <div className="text-gray-700 mb-3">
                      <p className="whitespace-pre-wrap">{truncatedBody}</p>
                      {needsTruncation && (
                        <Link
                          href={`/memories/${memory.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm mt-2 inline-block"
                        >
                          Read more
                        </Link>
                      )}
                    </div>

                    {/* Metadata */}
                    {memory.photo_count > 0 && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                        <span>
                          {memory.photo_count} image
                          {memory.photo_count !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Photo Thumbnail */}
                  {memory.cover_url && (
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 rounded-lg overflow-hidden relative">
                        <img
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
              </article>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
