import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import PageHeader from '@/components/PageHeader';
import Hero from '@/components/Hero';
import { serverFetch } from '@/lib/utils';
import ImageWithFallback from '@/components/ImageWithFallback';
import type { MemoryIndexItem } from '@/types/memory';

// Make this page dynamic to avoid build-time API calls
export const dynamic = 'force-dynamic';

export const fetchCache = 'force-no-store';

async function getMemories(): Promise<MemoryIndexItem[]> {
  const res = await serverFetch('/api/memories', {
    next: { tags: ['memories-index'] },
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function HomePage() {
  try {
    const memories = await getMemories();
    const recentMemories = memories.slice(0, 6);

    return (
      <>
        <Hero />
        <PageContainer>
          <PageHeader
            title="Remembering Paul"
            description="A place to share memories, photos, and stories about Paul. Help us celebrate his life and the impact he had on all of us."
          />

          <div className="text-center mb-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/memories/new" className="btn">
                Share a memory
              </Link>
              <Link href="/memories" className="btn-secondary">
                View all memories
              </Link>
            </div>
          </div>

          {recentMemories.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Recent memories</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentMemories.map((memory) => {
                  const bodyText = memory.body || '';
                  const truncatedBody =
                    bodyText.length > 200
                      ? bodyText.substring(0, 200).trim() + '...'
                      : bodyText;
                  const displayTitle = memory.title?.trim() || undefined;

                  return (
                    <Link
                      key={memory.id}
                      href={`/memories/${memory.id}`}
                      className="block"
                    >
                      <article className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group">
                        {/* Name and Date */}
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-medium text-gray-900">
                            {memory.name || 'Anonymous'}
                          </p>
                          <span className="text-gray-500 text-xs">
                            {new Date(memory.created_at).toLocaleDateString(
                              'en-US',
                              {
                                month: 'numeric',
                                day: 'numeric',
                                year: '2-digit',
                              }
                            )}
                          </span>
                        </div>

                        {/* Title */}
                        {displayTitle && (
                          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {displayTitle}
                          </h3>
                        )}

                        {/* Content */}
                        <div className="text-gray-700 text-sm mb-3">
                          <p className="whitespace-pre-wrap">{truncatedBody}</p>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </PageContainer>
      </>
    );
  } catch (error) {
    console.error('Error loading home page:', error);
    return (
      <>
        <Hero />
        <PageContainer>
          <PageHeader
            title="Paul Bedrosian Memorial"
            description="A place to share memories, photos, and stories about Paul. Help us celebrate his life and the impact he had on all of us."
          />
          <div className="text-center py-12">
            <p className="text-stone-600">
              Unable to load recent memories at this time.
            </p>
          </div>
        </PageContainer>
      </>
    );
  }
}
