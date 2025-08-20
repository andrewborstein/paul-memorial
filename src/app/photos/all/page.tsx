import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import PageHeader from '@/components/PageHeader';
import { serverFetch } from '@/lib/utils';
import ImageWithFallback from '@/components/ImageWithFallback';
import type { MemoryIndexItem, MemoryDetail } from '@/types/memory';
import SquareThumb from '@/components/SquareThumb';

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

async function getMemoryDetail(id: string): Promise<MemoryDetail | null> {
  const res = await serverFetch(`/api/memory/${id}`, {
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function AllPhotosPage() {
  try {
    const memories = await getMemories();
    const memoriesWithPhotos = memories.filter((m) => m.photo_count > 0);

    // Get all photos from all memories
    const allPhotos: Array<{
      public_id: string;
      memoryId: string;
      memoryTitle: string;
    }> = [];

    for (const memory of memoriesWithPhotos) {
      try {
        const detail = await getMemoryDetail(memory.id);
        if (detail?.photos) {
          detail.photos.forEach((photo) => {
            allPhotos.push({
              public_id: photo.public_id,
              memoryId: memory.id,
              memoryTitle: detail.title || detail.name,
            });
          });
        }
      } catch (error) {
        console.warn(`Failed to fetch details for memory ${memory.id}:`, error);
        // Continue with other memories
      }
    }

    return (
      <PageContainer>
        <PageHeader
          title="All Photos"
          description={`Browse all ${allPhotos.length} photos shared in memories.`}
        />

        {allPhotos.length === 0 ? (
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
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                All photos ({allPhotos.length})
              </h2>
              <Link
                href="/photos"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                ← Back to photos overview
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {allPhotos.map((photo) => (
                <Link
                  key={photo.public_id}
                  href={`/memories/photos/${photo.public_id}`}
                  className="block"
                >
                  <SquareThumb
                    publicId={photo.public_id}
                    alt={`Photo from ${photo.memoryTitle}`}
                    className="overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-end">
                    <div className="p-2 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {photo.memoryTitle}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </PageContainer>
    );
  } catch (error) {
    console.error('Error loading all photos page:', error);
    return (
      <PageContainer>
        <PageHeader
          title="All Photos"
          description="Browse all photos shared in memories."
        />

        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            Unable to load photos at this time.
          </p>
          <Link
            href="/memories/new"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Be the first to share photos
          </Link>
        </div>
      </PageContainer>
    );
  }
}
