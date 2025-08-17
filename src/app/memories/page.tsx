import Link from 'next/link'
import { getAllMemories } from '@/lib/memories'
import { optimizeImageUrl } from '@/lib/cloudinary'

export default async function MemoriesPage() {
  const memories = await getAllMemories()

  return (
    <section className="max-w-4xl mx-auto px-2">
      <div className="flex items-center justify-between mb-8 gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold mb-3">Memories</h1>
          <p className="text-gray-600">Read memories shared by friends and family.</p>
        </div>
        <Link 
          href="/memories/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap flex-shrink-0"
        >
          Share memory
        </Link>
      </div>

      {memories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No memories shared yet.</p>
          <Link 
            href="/memories/new"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Be the first to share a memory
          </Link>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {memories.map((memory) => (
            <Link 
              key={memory.id} 
              href={`/memories/${memory.id}`}
              className="block"
            >
              <article 
                className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow group"
              >
                <div className="flex gap-6">
                {/* Text Content */}
                <div className="flex-1 min-w-0">
                                      <header className="mb-2">
                                          <h2 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {memory.title || memory.name}
                    </h2>
                    </header>
                  
                  {memory.hasText && (
                    <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {memory.body}
                    </div>
                  )}
                  
                  {/* Metadata */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-2 flex-wrap">
                    <time>
                      {new Date(memory.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </time>
                    {memory.hasPhotos && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span>{memory.photos.length} image{memory.photos.length !== 1 ? 's' : ''}</span>
                      </>
                    )}
                    {/* TODO: Add comment count when available */}
                    {/* <span className="text-gray-300">•</span> */}
                    {/* <span>10 comments</span> */}
                  </div>
                </div>

                {/* Photo Thumbnail */}
                {memory.hasPhotos && (
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-lg overflow-hidden relative">
                      <img 
                        src={optimizeImageUrl(memory.photos[0].url, 96)} 
                        alt="Memory preview" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                        {memory.photos.length > 1 && (
                          <span className="text-white text-xs font-medium">
                            +{memory.photos.length - 1}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </article>
          </Link>
          ))}
        </div>
      )}
    </section>
  )
}
