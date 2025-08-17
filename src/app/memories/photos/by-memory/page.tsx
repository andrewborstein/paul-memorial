import Link from 'next/link'
import { getMemoriesWithPhotos } from '@/lib/memories'

export default async function PhotosByMemoryPage() {
  const memoriesWithPhotos = await getMemoriesWithPhotos()

  return (
    <div>
      {/* Breadcrumbs */}
      <nav className="mb-6">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link href="/memories" className="text-blue-600 hover:text-blue-800">
              Memories
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li>
            <Link href="/memories/photos" className="text-blue-600 hover:text-blue-800">
              Photos
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-600 font-medium">By memory</li>
        </ol>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Photos by memory</h1>
        <p className="text-gray-600 mt-2">Photos organized by the memories they were shared in</p>
      </div>

      {memoriesWithPhotos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No photos found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {memoriesWithPhotos.map((memory) => (
            <Link 
              key={memory.id} 
              href={`/memories/${memory.id}`}
              className="group block"
            >
              <div className="aspect-square overflow-hidden rounded-lg mb-3">
                <img 
                  src={memory.photos[0].url} 
                  alt={memory.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <h3 className="font-medium text-sm mb-1">{memory.name}</h3>
              <p className="text-xs text-gray-500 mb-2">{memory.photos.length} photos</p>
              {memory.hasText && (
                <p className="text-xs text-gray-600 line-clamp-2">
                  {memory.body}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
