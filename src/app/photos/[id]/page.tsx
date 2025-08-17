import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getPhotoById,
  getAlbumById,
  getAllPhotos,
  getAlbums,
} from '@/lib/photos';

interface PhotoPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}

export default async function PhotoPage({
  params,
  searchParams,
}: PhotoPageProps) {
  const { id } = await params;
  const { from } = await searchParams;
  const photo = await getPhotoById(id);

  if (!photo) {
    notFound();
  }

  // Get navigation context
  let allPhotos: any[] = [];
  let currentIndex = -1;
  let prevPhoto: any = null;
  let nextPhoto: any = null;

  if (from?.includes('/photos/all')) {
    // Navigation within all photos
    allPhotos = await getAllPhotos();
    currentIndex = allPhotos.findIndex((p) => p.id === id);
    if (currentIndex > 0) prevPhoto = allPhotos[currentIndex - 1];
    if (currentIndex < allPhotos.length - 1)
      nextPhoto = allPhotos[currentIndex + 1];
  } else if (photo.albumId) {
    // Navigation within album
    const album = await getAlbumById(photo.albumId);
    if (album) {
      allPhotos = album.photos;
      currentIndex = allPhotos.findIndex((p) => p.id === id);
      if (currentIndex > 0) prevPhoto = allPhotos[currentIndex - 1];
      if (currentIndex < allPhotos.length - 1)
        nextPhoto = allPhotos[currentIndex + 1];
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumbs and Navigation */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Breadcrumbs */}
          <nav>
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link
                  href="/photos"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Photos
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              {from?.includes('/photos/all') ? (
                <>
                  <li>
                    <Link
                      href="/photos/all"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      All Photos
                    </Link>
                  </li>
                  <li className="text-gray-400">/</li>
                </>
              ) : photo.albumId ? (
                <>
                  <li>
                    <Link
                      href="/photos/albums"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Albums
                    </Link>
                  </li>
                  <li className="text-gray-400">/</li>
                  <li>
                    <Link
                      href={`/photos/albums/${photo.albumId}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {photo.albumName}
                    </Link>
                  </li>
                  <li className="text-gray-400">/</li>
                </>
              ) : null}
              <li className="text-gray-600 font-medium">
                Photo{' '}
                {photo.albumIndex && photo.totalInAlbum
                  ? `${photo.albumIndex} of ${photo.totalInAlbum}`
                  : ''}
              </li>
            </ol>
          </nav>

          {/* Navigation Controls */}
          {(prevPhoto || nextPhoto) && (
            <div className="flex items-center space-x-2">
              {prevPhoto && (
                <Link
                  href={`/photos/${prevPhoto.id}?from=${from || (photo.albumId ? `/photos/albums/${photo.albumId}` : '/photos/all')}`}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  ← Previous
                </Link>
              )}
              {nextPhoto && (
                <Link
                  href={`/photos/${nextPhoto.id}?from=${from || (photo.albumId ? `/photos/albums/${photo.albumId}` : '/photos/all')}`}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Next →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Photo Display */}
      <div className="aspect-auto max-h-[70vh] overflow-hidden rounded-lg">
        <img
          src={photo.url}
          alt={photo.caption || 'Photo'}
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}
