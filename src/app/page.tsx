import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
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

export default async function HomePage() {
  try {
    const memories = await getMemories();
    const recentMemories = memories.slice(0, 6);

    return (
      <PageContainer>
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Paul Bedrosian Memorial
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A place to share memories, photos, and stories about Paul. Help us
            celebrate his life and the impact he had on all of us.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/memories/new"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Share a memory
            </Link>
            <Link
              href="/memories"
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors font-medium"
            >
              View memories
            </Link>
          </div>
        </div>

        {recentMemories.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Recent memories</h2>
              <Link
                href="/memories"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View all
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentMemories.map((memory) => (
                <Link
                  key={memory.id}
                  href={`/memories/${memory.id}`}
                  className="block"
                >
                  <article className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group">
                    <div className="flex gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {memory.title || memory.name || 'Untitled'}
                        </h3>
                        {memory.photo_count > 0 && (
                          <p className="text-xs text-gray-500">
                            {memory.photo_count} photo
                            {memory.photo_count !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>

                      {memory.cover_url && (
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 rounded overflow-hidden">
                            <ImageWithFallback
                              publicId={memory.cover_url.split('/').pop() || ''}
                              alt="Memory preview"
                              className="w-full h-full object-cover"
                              width={64}
                              quality={60}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        )}
      </PageContainer>
    );
  } catch (error) {
    console.error('Error loading home page:', error);
    return (
      <PageContainer>
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Paul Bedrosian Memorial
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A place to share memories, photos, and stories about Paul. Help us
            celebrate his life and the impact he had on all of us.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/memories/new"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Share a memory
            </Link>
            <Link
              href="/memories"
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors font-medium"
            >
              View memories
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }
}
