import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import { serverFetch } from '@/lib/utils';
import PhotoImage from '@/components/PhotoImage';
import type { MemoryDetail } from '@/types/memory';

// Make this page dynamic to avoid build-time API calls
export const dynamic = 'force-dynamic';

async function getPhotoData(photoId: string) {
  const res = await serverFetch(`/api/photo/${photoId}`, {
    cache: 'no-store',
  });
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
        <div className="space-y-6">
          {/* Breadcrumbs and Navigation */}
          <div className="flex items-center justify-between flex-wrap">
            <nav>
              <ol className="flex items-center space-x-2 text-sm">
                <li className="flex items-center gap-2">
                  <Link
                    href="/memories"
                    className="text-blue-600 hover:text-blue-800 whitespace-nowrap"
                  >
                    Memories
                  </Link>
                  <span className="text-gray-400">/</span>
                </li>
                <li className="flex items-center gap-2">
                  <Link
                    href={`/memories/${memory.id}`}
                    className="text-blue-600 hover:text-blue-800 whitespace-nowrap"
                  >
                    {displayTitle}
                  </Link>
                  <span className="text-gray-400">/</span>
                </li>
                <li className="text-gray-600 font-medium whitespace-nowrap">
                  Photo {photoIndex + 1} of {memory.photos.length}
                </li>
              </ol>
            </nav>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-2 py-4 w-full sm:w-auto">
              {prevPhoto ? (
                <Link
                  href={`/memories/photos/${prevPhoto.public_id}`}
                  className="flex-1 sm:flex-none px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 text-center"
                >
                  ← Previous
                </Link>
              ) : (
                <div className="flex-1 sm:flex-none px-3 py-1 text-gray-400 text-sm text-center">
                  ← Previous
                </div>
              )}

              {nextPhoto ? (
                <Link
                  href={`/memories/photos/${nextPhoto.public_id}`}
                  className="flex-1 sm:flex-none px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 text-center"
                >
                  Next →
                </Link>
              ) : (
                <div className="flex-1 sm:flex-none px-3 py-1 text-gray-400 text-sm text-center">
                  Next →
                </div>
              )}
            </div>
          </div>

          {/* Photo Display */}
          <div className="flex justify-center">
            <PhotoImage
              publicId={photo.public_id}
              alt={photo.caption || 'Photo'}
              className="max-w-full h-auto rounded-lg shadow-lg"
              priority={true}
            />
          </div>
        </div>
      </PageContainer>
    );
  } catch (error) {
    notFound();
  }
}
