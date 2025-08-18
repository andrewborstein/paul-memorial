import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cldUrl } from '@/lib/cloudinary';
import PageContainer from '@/components/PageContainer';
import type { MemoryDetail } from '@/types/memory';

// Make this page dynamic to avoid build-time API calls
export const dynamic = 'force-dynamic';

async function getPhotoData(photoId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/photo/${photoId}`,
    {
      next: { revalidate: 60 },
    }
  );
  if (!res.ok) throw new Error('Not found');
  return res.json();
}

export default async function PhotoPage({
  params,
}: {
  params: Promise<{ id: string[] }>;
}) {
  const { id } = await params;
  const photoId = id.join('/'); // Join the segments back together

  try {
    const { memory, photo, photoIndex } = await getPhotoData(photoId);
    const displayTitle = memory.title || memory.name;

    const prevPhoto = photoIndex > 0 ? memory.photos[photoIndex - 1] : null;
    const nextPhoto =
      photoIndex < memory.photos.length - 1
        ? memory.photos[photoIndex + 1]
        : null;

    return (
      <PageContainer>
        {/* Breadcrumbs and Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <nav>
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
              <li>
                <Link
                  href={`/memories/${memory.id}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {displayTitle}
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-600 font-medium">
                Photo {photoIndex + 1} of {memory.photos.length}
              </li>
            </ol>
          </nav>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            {prevPhoto ? (
              <Link
                href={`/memories/photos/${prevPhoto.public_id}`}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
              >
                ← Previous
              </Link>
            ) : (
              <div className="px-3 py-1 text-gray-400 text-sm">← Previous</div>
            )}

            {nextPhoto ? (
              <Link
                href={`/memories/photos/${nextPhoto.public_id}`}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
              >
                Next →
              </Link>
            ) : (
              <div className="px-3 py-1 text-gray-400 text-sm">Next →</div>
            )}
          </div>
        </div>

        {/* Photo Display */}
        <div className="flex justify-center">
          <img
            src={cldUrl(photo.public_id, { w: 1200 })}
            alt={photo.caption || 'Photo'}
            className="max-w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      </PageContainer>
    );
  } catch (error) {
    notFound();
  }
}
