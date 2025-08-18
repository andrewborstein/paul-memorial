import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cldUrl } from '@/lib/cloudinary';
import PageContainer from '@/components/PageContainer';
import type { MemoryDetail } from '@/types/memory';

// Make this page dynamic to avoid build-time API calls
export const dynamic = 'force-dynamic';

async function getPhotoData(photoId: string) {
  const res = await fetch(`/api/photo/${photoId}`, {
    next: { revalidate: 60 },
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

        {/* Photo Display */}
        <div className="space-y-6">
          {/* Photo */}
          <div className="flex justify-center">
            <img
              src={cldUrl(photo.public_id, { w: 1200 })}
              alt={photo.caption || 'Photo'}
              className="max-w-full h-auto rounded-lg shadow-lg"
            />
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            {prevPhoto ? (
              <Link
                href={`/memories/photos/${prevPhoto.public_id}`}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                ← Previous
              </Link>
            ) : (
              <div></div>
            )}

            <div className="text-center text-sm text-gray-600">
              Photo {photoIndex + 1} of {memory.photos.length}
            </div>

            {nextPhoto ? (
              <Link
                href={`/memories/photos/${nextPhoto.public_id}`}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Next →
              </Link>
            ) : (
              <div></div>
            )}
          </div>

          {/* Photo Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-medium mb-2">Photo Details</h2>
            <p className="text-gray-600 mb-2">
              <strong>Memory:</strong> {displayTitle}
            </p>
            <p className="text-gray-600 mb-2">
              <strong>Shared by:</strong> {memory.name}
            </p>
            {photo.caption && (
              <p className="text-gray-600">
                <strong>Caption:</strong> {photo.caption}
              </p>
            )}
          </div>
        </div>
      </PageContainer>
    );
  } catch (error) {
    notFound();
  }
}
