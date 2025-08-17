import Link from 'next/link'
import { getRecentMemories, getRecentPhotos } from '@/lib/memories'

export default async function MemoriesPage() {
  const recentMemories = await getRecentMemories(6)
  const recentPhotos = await getRecentPhotos(5)

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-4">Memories</h1>
          <p className="mb-6 text-gray-600">Browse memories and photos shared by friends and family.</p>
        </div>
        <Link 
          href="/memories/upload"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Share Memory
        </Link>
      </div>

      {/* Recent Memories */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium">Recent Memories</h2>
          <Link 
            href="/memories/all" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            View all memories
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentMemories.map((memory) => (
            <Link 
              key={memory.id} 
              href={`/memories/${memory.id}`}
              className="block group"
            >
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                {/* Photo Preview */}
                {memory.hasPhotos && (
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={memory.photos[0].url} 
                      alt="Memory preview" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {memory.photos.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        +{memory.photos.length - 1}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Content */}
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-2">{memory.name}</h3>
                  {memory.hasText && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {memory.body}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(memory.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Photos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium">Recent Photos</h2>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {recentPhotos.map((photo) => (
            <Link 
              key={photo.id} 
              href={`/memories/photos/${photo.id}`}
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
    </section>
  )
}
