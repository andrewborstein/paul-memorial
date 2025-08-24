import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import { serverFetch } from '@/lib/utils';
import PhotoImage from '@/components/PhotoImage';
import { getFullSizeUrl } from '@/lib/cloudinary';
import { readMemory } from '@/lib/data';

// Make this page dynamic to avoid build-time API calls
export const dynamic = 'force-dynamic';

async function getPhotoData(memoryId: string, photoId: string) {
  try {
    // Direct memory lookup - no scanning needed!
    const memory = await readMemory(memoryId);
    if (!memory) throw new Error('Memory not found');

    const photo = memory.photos.find((p) => p.public_id === photoId);
    if (!photo) throw new Error('Photo not found');

    const photoIndex = memory.photos.findIndex((p) => p.public_id === photoId);

    return { memory, photo, photoIndex };
  } catch (error) {
    throw new Error('Not found');
  }
}

export default async function PhotoPage({
  params,
}: {
  params: Promise<{ id: string; photoId: string[] }>;
}) {
  const { id: memoryId, photoId } = await params;
  const fullPhotoId = photoId.join('/'); // Join the segments back together

  try {
    const { memory, photo, photoIndex } = await getPhotoData(
      memoryId,
      fullPhotoId
    );
    const displayTitle = memory.title || memory.name;

    const prevPhoto = photoIndex > 0 ? memory.photos[photoIndex - 1] : null;
    const nextPhoto =
      photoIndex < memory.photos.length - 1
        ? memory.photos[photoIndex + 1]
        : null;

    return (
      <>
        {/* Preload next and previous images */}
        {prevPhoto && (
          <link
            rel="preload"
            as="image"
            href={getFullSizeUrl(prevPhoto.public_id)}
          />
        )}
        {nextPhoto && (
          <link
            rel="preload"
            as="image"
            href={getFullSizeUrl(nextPhoto.public_id)}
          />
        )}

        {/* Hidden images to force loading */}
        {prevPhoto && (
          <div style={{ display: 'none' }}>
            <PhotoImage publicId={prevPhoto.public_id} alt="" priority={true} />
          </div>
        )}
        {nextPhoto && (
          <div style={{ display: 'none' }}>
            <PhotoImage publicId={nextPhoto.public_id} alt="" priority={true} />
          </div>
        )}

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
                    href={`/memories/${memoryId}/photos/${prevPhoto.public_id}`}
                    prefetch={true}
                    className="flex-1 sm:flex-none px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 text-center link"
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
                    href={`/memories/${memoryId}/photos/${nextPhoto.public_id}`}
                    prefetch={true}
                    className="flex-1 sm:flex-none px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 text-center link"
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
      </>
    );
  } catch (error) {
    notFound();
  }
}
