import Link from 'next/link';
import { getAllPhotos, getMemoriesWithPhotos } from '@/lib/memories';
import { optimizeImageUrl } from '@/lib/cloudinary';

export default async function PhotosPage() {
  const allPhotos = await getAllPhotos();
  const memoriesWithPhotos = await getMemoriesWithPhotos();

  return (
    <section className="max-w-4xl mx-auto px-2">
      <div className="space-y-8">
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold mb-3">Photos</h1>
            <p className="text-gray-600">Browse photos shared in memories.</p>
          </div>
          <Link
            href="/memories/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap flex-shrink-0"
          >
            Share memory
          </Link>
        </div>

        {/* All Photos */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium">All photos</h2>
            <Link
              href="/memories/photos"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View all photos
            </Link>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Browse all photos shared in memories.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {allPhotos.slice(0, 10).map((photo) => (
              <Link
                key={photo.id}
                href={`/memories/photos/${photo.id}`}
                className="aspect-square overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
              >
                <img
                  src={optimizeImageUrl(photo.url, 200)}
                  alt={photo.caption || 'Photo'}
                  className="w-full h-full object-cover"
                />
              </Link>
            ))}
          </div>
        </div>

        {/* Photos by Memory */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium">Photos by memory</h2>
            <Link
              href="/memories/photos/by-memory"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View all
            </Link>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Photos organized by the memories they were shared in.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {memoriesWithPhotos.slice(0, 6).map((memory) => (
              <Link
                key={memory.id}
                href={`/memories/${memory.id}`}
                className="group block"
              >
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-4">
                    <h3 className="font-medium text-sm mb-1">
                      {memory.title || memory.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {memory.photos.length} photos
                    </p>
                  </div>
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={optimizeImageUrl(memory.photos[0].url, 300, 60)}
                      alt={memory.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
