import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPhotoById, getAllPhotos } from '@/lib/memories'

interface PhotoPageProps {
  params: { id: string }
  searchParams: { from?: string }
}

export default async function PhotoPage({ params, searchParams }: PhotoPageProps) {
  const { id } = await params
  const { from } = await searchParams
  const photo = await getPhotoById(id)
  
  if (!photo) {
    notFound()
  }

  // Get navigation context
  let allPhotos: any[] = []
  let currentIndex = -1
  let prevPhoto: any = null
  let nextPhoto: any = null

  if (from?.includes('/memories/photos')) {
    // Navigation within all photos
    allPhotos = await getAllPhotos()
    currentIndex = allPhotos.findIndex(p => p.id === id)
    if (currentIndex > 0) prevPhoto = allPhotos[currentIndex - 1]
    if (currentIndex < allPhotos.length - 1) nextPhoto = allPhotos[currentIndex + 1]
  } else {
    // Navigation within memory
    const memoryResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/memories/${photo.memoryId}`)
    const memory = await memoryResponse.json()
    allPhotos = memory.photos
    currentIndex = allPhotos.findIndex(p => p.id === id)
    if (currentIndex > 0) prevPhoto = allPhotos[currentIndex - 1]
    if (currentIndex < allPhotos.length - 1) nextPhoto = allPhotos[currentIndex + 1]
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
                <Link href="/memories" className="text-blue-600 hover:text-blue-800">
                  Memories
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              {from?.includes('/memories/photos') ? (
                <>
                  <li>
                    <Link href="/memories/photos" className="text-blue-600 hover:text-blue-800">
                      Photos
                    </Link>
                  </li>
                  <li className="text-gray-400">/</li>
                </>
              ) : (
                <>
                  <li>
                    <Link href={`/memories/${photo.memoryId}`} className="text-blue-600 hover:text-blue-800">
                      {photo.memoryName}
                    </Link>
                  </li>
                  <li className="text-gray-400">/</li>
                </>
              )}
              <li className="text-gray-600 font-medium">
                Photo {photo.memoryIndex && photo.totalInMemory ? `${photo.memoryIndex} of ${photo.totalInMemory}` : ''}
              </li>
            </ol>
          </nav>

          {/* Navigation Controls */}
          {(prevPhoto || nextPhoto) && (
            <div className="flex items-center space-x-2">
              {prevPhoto && (
                <Link
                  href={`/memories/photos/${prevPhoto.id}?from=${from || `/memories/${photo.memoryId}`}`}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  ← Previous
                </Link>
              )}
              {nextPhoto && (
                <Link
                  href={`/memories/photos/${nextPhoto.id}?from=${from || `/memories/${photo.memoryId}`}`}
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
  )
}
