import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import { serverFetch } from '@/lib/utils';
import PhotoImage from '@/components/PhotoImage';
import { getFullSizeUrl } from '@/lib/cloudinary';
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

async function getAllPhotos() {
  const res = await serverFetch('/api/photos-index', {
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.photos || [];
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

    // Get all photos for global navigation
    const allPhotos = await getAllPhotos();
    const currentPhotoIndex = allPhotos.findIndex(
      (p: any) => p.public_id === photoId
    );

    const prevPhoto =
      currentPhotoIndex > 0 ? allPhotos[currentPhotoIndex - 1] : null;
    const nextPhoto =
      currentPhotoIndex < allPhotos.length - 1
        ? allPhotos[currentPhotoIndex + 1]
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

        {/* Modal overlay */}
        <div className="fixed inset-0 bg-black bg-opacity-[0.93] z-50 flex flex-col">
          {/* Header with breadcrumbs and desktop controls */}
          <PageContainer className="flex-shrink-0 w-full">
            <div className="py-4 flex items-center justify-between">
              <nav>
                <ol className="flex flex-wrap items-center gap-2 text-sm text-white">
                  <li className="flex items-center">
                    <Link
                      href="/memories"
                      className="text-blue-300 hover:text-blue-100 whitespace-nowrap"
                    >
                      Memories
                    </Link>
                    <span className="text-gray-400 ml-2 whitespace-nowrap">
                      /
                    </span>
                  </li>
                  <li className="flex items-center">
                    <Link
                      href={`/memories/${memory.id}`}
                      className="text-blue-300 hover:text-blue-100 whitespace-nowrap"
                    >
                      {displayTitle}
                    </Link>
                    <span className="text-gray-400 ml-2 whitespace-nowrap">
                      /
                    </span>
                  </li>
                  <li className="text-gray-300 font-medium whitespace-nowrap">
                    Photo {currentPhotoIndex + 1} of {allPhotos.length}
                  </li>
                </ol>
              </nav>

              {/* Desktop controls */}
              <div className="hidden md:flex items-center gap-4">
                <Link
                  href={`/memories/${memory.id}`}
                  className="px-4 py-2 bg-transparent border border-white text-white rounded hover:bg-white hover:text-black text-center uppercase tracking-widest text-xs font-semibold"
                >
                  Exit
                </Link>
                {prevPhoto ? (
                  <Link
                    href={`/memories/photos/${prevPhoto.public_id}`}
                    className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 text-center whitespace-nowrap uppercase tracking-widest text-xs font-semibold"
                  >
                    ← Previous
                  </Link>
                ) : (
                  <div className="px-4 py-2 text-gray-500 text-center uppercase tracking-widest text-xs font-semibold">
                    ← Previous
                  </div>
                )}

                {nextPhoto ? (
                  <Link
                    href={`/memories/photos/${nextPhoto.public_id}`}
                    className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 text-center uppercase tracking-widest text-xs font-semibold"
                  >
                    Next →
                  </Link>
                ) : (
                  <div className="px-4 py-2 text-gray-500 text-center uppercase tracking-widest text-xs font-semibold">
                    Next →
                  </div>
                )}
              </div>
            </div>
          </PageContainer>

          {/* Photo area - takes remaining space */}
          <div className="flex-1 flex items-center justify-center">
            {/* Photo */}
            <div className="flex items-center justify-center">
              <PhotoImage
                publicId={photo.public_id}
                alt={photo.caption || 'Photo'}
                className="max-h-[calc(100vh-120px)] max-w-screen object-contain"
                priority={true}
              />
            </div>

            {/* Photo caption overlay */}
            {photo.caption && (
              <div className="absolute bottom-4 left-4 right-4 text-white text-center">
                <div className="bg-black bg-opacity-50 rounded-lg p-3">
                  <p className="text-sm">{photo.caption}</p>
                </div>
              </div>
            )}
          </div>

          {/* Mobile controls at bottom */}
          <PageContainer className="flex-shrink-0 w-full md:hidden">
            <div className="flex items-center justify-between gap-4 py-4">
              <div className="flex items-center gap-4">
                {prevPhoto ? (
                  <Link
                    href={`/memories/photos/${prevPhoto.public_id}`}
                    className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 text-center whitespace-nowrap uppercase tracking-widest text-xs font-semibold"
                  >
                    ← Previous
                  </Link>
                ) : (
                  <div className="px-4 py-2 text-gray-500 text-center uppercase tracking-widest text-xs font-semibold">
                    ← Previous
                  </div>
                )}

                {nextPhoto ? (
                  <Link
                    href={`/memories/photos/${nextPhoto.public_id}`}
                    className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 text-center uppercase tracking-widest text-xs font-semibold"
                  >
                    Next →
                  </Link>
                ) : (
                  <div className="px-4 py-2 text-gray-500 text-center uppercase tracking-widest text-xs font-semibold">
                    Next →
                  </div>
                )}
              </div>
              <Link
                href={`/memories/${memory.id}`}
                className="px-4 py-2 bg-transparent border border-white text-white rounded hover:bg-white hover:text-black text-center uppercase tracking-widest text-xs font-semibold"
              >
                Exit
              </Link>
            </div>
          </PageContainer>
        </div>
      </>
    );
  } catch (error) {
    notFound();
  }
}
