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
    next: { revalidate: 60 },
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function PhotosByMemoryPage() {
  const memories = await getMemories();
  const memoriesWithPhotos = memories.filter((m) => m.photo_count > 0);

  return (
    <PageContainer>
      <PageHeader
        title="Photos by memory"
        description="Browse photos organized by their parent memories."
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
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
