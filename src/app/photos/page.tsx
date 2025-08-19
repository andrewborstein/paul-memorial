import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import PageHeader from '@/components/PageHeader';
import { serverFetch } from '@/lib/utils';
import ImageWithFallback from '@/components/ImageWithFallback';
import type { MemoryIndexItem, MemoryDetail } from '@/types/memory';

// Make this page dynamic to avoid build-time API calls
export const dynamic = 'force-dynamic';

async function getMemories(): Promise<MemoryIndexItem[]> {
  // Add timestamp to bust cache
  const timestamp = Date.now();
  const res = await serverFetch(`/api/memories?t=${timestamp}`, {
    cache: 'no-store',
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

export default async function PhotosPage() {
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

    // Show first 10 photos, then a "View all" link
    const displayPhotos = allPhotos.slice(0, 10);
    const hasMorePhotos = allPhotos.length > 10;

    return (
      <PageContainer>
        <PageHeader
          title="Photos"
          description="Browse all photos shared in memories."
        />

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
            <div>
              <h2 className="text-lg font-semibold mb-4">
                All photos ({allPhotos.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {displayPhotos.map((photo) => (
                  <Link
                    key={photo.public_id}
                    href={`/memories/photos/${photo.public_id}`}
                    className="aspect-square overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <ImageWithFallback
                      publicId={photo.public_id}
                      alt={`Photo from ${photo.memoryTitle}`}
                      className="w-full h-full object-cover"
                      width={300}
                      quality="auto"
                    />
                  </Link>
                ))}
              </div>
              {hasMorePhotos && (
                <div className="text-center mt-6">
                  <Link
                    href="/memories/photos"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View all {allPhotos.length} photos
                  </Link>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Photos by memory</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {memoriesWithPhotos.map((memory) => {
                  console.log('Memory debug:', {
                    id: memory.id,
                    title: memory.title,
                    cover_public_id: memory.cover_public_id,
                    photo_count: memory.photo_count,
                  });
                  return (
                    <Link
                      key={memory.id}
                      href={`/memories/${memory.id}`}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow group"
                    >
                      <div className="p-4">
                        <h3 className="font-medium text-sm mb-1 group-hover:text-blue-600 transition-colors">
                          {memory.title}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {memory.photo_count} photo
                          {memory.photo_count !== 1 ? 's' : ''}
                        </p>
                      </div>

                      {memory.cover_public_id && (
                        <div className="aspect-square">
                          <ImageWithFallback
                            publicId={memory.cover_public_id}
                            alt={`Preview of ${memory.title}`}
                            className="w-full h-full object-cover"
                            width={300}
                            quality="auto"
                          />
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    );
  } catch (error) {
    console.error('Error loading photos page:', error);
    return (
      <PageContainer>
        <PageHeader
          title="Photos"
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
