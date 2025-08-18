import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cldUrl } from '@/lib/cloudinary';
import PageContainer from '@/components/PageContainer';

import type { MemoryDetail } from '@/types/memory';

// Make this page dynamic to avoid build-time API calls
export const dynamic = 'force-dynamic';

async function getMemory(id: string): Promise<MemoryDetail> {
  const res = await fetch(`/api/memory/${id}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error('Not found');
  return res.json();
}

export default async function MemoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  console.log('MemoryPage: Attempting to load memory with ID:', id);

  try {
    const memory = await getMemory(id);
    console.log('MemoryPage: Successfully loaded memory:', memory.id);
    const displayTitle = memory.title || memory.name;

    return (
      <PageContainer>
        {/* Breadcrumbs */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link
                href="/memories"
                className="text-blue-600 hover:text-blue-800"
              >
                Memories
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-600 font-medium">{displayTitle}</li>
          </ol>
        </nav>

        {/* Memory Content */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold">{displayTitle}</h1>
            <p className="text-gray-600 mt-1">Shared by {memory.name}</p>
          </div>

          {/* Text Content */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="text-gray-700 whitespace-pre-wrap">{memory.body}</p>
          </div>

          {/* Photos */}
          {memory.photos.length > 0 && (
            <div>
              <h2 className="text-lg font-medium mb-4">
                Photos ({memory.photos.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {memory.photos.map((photo) => (
                  <Link
                    key={photo.public_id}
                    href={`/memories/photos/${photo.public_id}`}
                    className="aspect-square overflow-hidden rounded-lg group cursor-pointer"
                  >
                    <img
                      src={cldUrl(photo.public_id, { w: 1200 })}
                      alt={photo.caption || 'Photo'}
                      className="w-full h-full object-cover"
                    />
                    {photo.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        {photo.caption}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </PageContainer>
    );
  } catch (error) {
    console.error('MemoryPage: Error loading memory:', error);
    notFound();
  }
}
