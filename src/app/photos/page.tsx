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

export default async function PhotosPage() {
  const memories = await getMemories();
  const memoriesWithPhotos = memories.filter((m) => m.photo_count > 0);

  // Get all photos from all memories
  const allPhotos: Array<{
    public_id: string;
    memoryId: string;
    memoryTitle: string;
  }> = [];

  for (const memory of memoriesWithPhotos) {
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
  }

  // Show first 20 photos, then a "View all" link
  const displayPhotos = allPhotos.slice(0, 20);
  const hasMorePhotos = allPhotos.length > 20;

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
            <h2 className="text-lg font-semibold mb-4">All photos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {displayPhotos.map((photo) => (
                <Link
                  key={photo.public_id}
                  href={`/memories/photos/${photo.public_id}`}
                  className="aspect-square overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
                >
                  <img
                    src={cldUrl(photo.public_id, { w: 400 })}
                    alt={`Photo from ${photo.memoryTitle}`}
                    className="w-full h-full object-cover"
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
              {memoriesWithPhotos.map((memory) => (
                <div
                  key={memory.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div className="p-4">
                    <h3 className="font-medium text-sm mb-1">
                      <Link
                        href={`/memories/${memory.id}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {memory.title}
                      </Link>
                    </h3>
                    <p className="text-xs text-gray-500">
                      {memory.photo_count} photo
                      {memory.photo_count !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {memory.cover_url && (
                    <div className="aspect-video">
                      <img
                        src={memory.cover_url}
                        alt={`Preview of ${memory.title}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
