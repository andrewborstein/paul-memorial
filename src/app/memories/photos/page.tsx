import Link from 'next/link';
import { cldUrl } from '@/lib/cloudinary';
import PageContainer from '@/components/PageContainer';
import PageHeader from '@/components/PageHeader';
import { serverFetch } from '@/lib/utils';
import ImageWithFallback from '@/components/ImageWithFallback';
import type { MemoryIndexItem } from '@/types/memory';

// Make this page dynamic to avoid build-time API calls
export const dynamic = 'force-dynamic';

async function getMemories(): Promise<MemoryIndexItem[]> {
  const res = await serverFetch('/api/memories', {
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function PhotosPage() {
  const memories = await getMemories();
  const memoriesWithPhotos = memories.filter((m) => m.photo_count > 0);

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-8 gap-4">
        <div className="min-w-0 flex-1">
          <PageHeader
            title="Photos"
            description="Browse all photos shared in memories."
          />
        </div>
        <Link
          href="/memories/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap flex-shrink-0"
        >
          Share memory
        </Link>
      </div>

      {memoriesWithPhotos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No photos shared yet.</p>
          <Link
            href="/memories/new"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Be the first to share photos
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {memoriesWithPhotos.map((memory) => (
            <div
              key={memory.id}
              className="bg-white border border-gray-200 rounded-lg p-6"
            >
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  <Link
                    href={`/memories/${memory.id}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {memory.title}
                  </Link>
                </h2>
                <p className="text-sm text-gray-500">
                  {memory.photo_count} photo
                  {memory.photo_count !== 1 ? 's' : ''}
                </p>
              </div>

              {memory.cover_public_id && (
                <div className="aspect-square overflow-hidden rounded-lg">
                  <ImageWithFallback
                    publicId={memory.cover_public_id}
                    alt={`Preview of ${memory.title}`}
                    className="w-full h-full object-cover"
                    width={300}
                    quality="auto"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
