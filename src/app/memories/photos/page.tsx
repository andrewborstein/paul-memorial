import Link from 'next/link'
import { getAllPhotos } from '@/lib/memories'

export default async function AllPhotosPage() {
  const photos = await getAllPhotos()

  return (
    <div>
      <div className="mb-6">
        <Link 
          href="/memories"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium mb-4"
        >
          ← Back to Memories
        </Link>
        <h1 className="text-2xl font-semibold">All Photos</h1>
        <p className="text-gray-600 mt-2">Browse all photos shared in memories</p>
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No photos found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {photos.map((photo) => (
            <Link 
              key={photo.id} 
              href={`/memories/photos/${photo.id}?from=/memories/photos`}
              className="aspect-square overflow-hidden rounded-lg hover:opacity-90 transition-opacity group"
            >
              <img 
                src={photo.url} 
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
      )}
    </div>
  )
}
