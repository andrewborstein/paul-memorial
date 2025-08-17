import Link from 'next/link'
import { getRecentPhotos, getAlbums } from '@/lib/photos'

export default async function Photos() {
  const recentPhotos = await getRecentPhotos(5)
  const albums = await getAlbums()

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-4">Photos</h1>
          <p className="mb-6 text-gray-600">Browse photos & video links shared in memories.</p>
        </div>
        <Link 
          href="/photos/upload"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Upload Photos
        </Link>
      </div>

      {/* All Photos Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium">All Photos</h2>
          <Link 
            href="/photos/all" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            View all photos
          </Link>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Browse all photos shared in memories, organized chronologically.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {recentPhotos.map((photo) => (
            <Link 
              key={photo.id} 
              href={`/photos/${photo.id}`}
              className="aspect-square overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
            >
              <img 
                src={photo.url} 
                alt={photo.caption || 'Photo'} 
                className="w-full h-full object-cover"
              />
            </Link>
          ))}
        </div>
      </div>

      {/* Albums Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium">Albums</h2>
          <Link 
            href="/photos/albums" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            View all albums
          </Link>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Photos organized by the memories they were shared in.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {albums.slice(0, 6).map((album) => (
            <Link 
              key={album.id} 
              href={`/photos/albums/${album.id}`}
              className="group block"
            >
              <div className="aspect-square overflow-hidden rounded-lg mb-2">
                {album.thumbnail && (
                  <img 
                    src={album.thumbnail} 
                    alt={album.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                )}
              </div>
              <h3 className="font-medium text-sm">{album.name}</h3>
              <p className="text-xs text-gray-500">{album.photoCount} photos</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
