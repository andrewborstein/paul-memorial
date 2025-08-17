import Link from 'next/link'
import { getAlbums } from '@/lib/photos'

export default async function AlbumsPage() {
  const albums = await getAlbums()

  return (
    <div>
      <div className="mb-6">
        <Link 
          href="/photos"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium mb-4"
        >
          ← Back to Photos
        </Link>
        <h1 className="text-2xl font-semibold">Albums</h1>
        <p className="text-gray-600 mt-2">Photos organized by memories</p>
      </div>

      {albums.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No albums found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {albums.map((album) => (
            <Link 
              key={album.id} 
              href={`/photos/albums/${album.id}`}
              className="group block"
            >
              <div className="aspect-square overflow-hidden rounded-lg mb-3">
                {album.thumbnail ? (
                  <img 
                    src={album.thumbnail} 
                    alt={album.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No preview</span>
                  </div>
                )}
              </div>
              <h3 className="font-medium text-sm mb-1">{album.name}</h3>
              <p className="text-xs text-gray-500">{album.photoCount} photos</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
