'use client'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { useState, useEffect } from 'react'

interface MemoryPageProps {
  params: { id: string }
}

export default function MemoryPage({ params }: MemoryPageProps) {
  const [memory, setMemory] = useState<any>(null)
  const [prevMemory, setPrevMemory] = useState<any>(null)
  const [nextMemory, setNextMemory] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadMemory() {
      const { id } = await params
      const response = await fetch(`/api/memories/${id}`)
      if (!response.ok) {
        notFound()
      }
      const memoryData = await response.json()
      setMemory(memoryData)
      
      // Get navigation context
      const allResponse = await fetch('/api/memories')
      const allMemories = await allResponse.json()
      const currentIndex = allMemories.findIndex((m: any) => m.id === id)
      if (currentIndex > 0) setPrevMemory(allMemories[currentIndex - 1])
      if (currentIndex < allMemories.length - 1) setNextMemory(allMemories[currentIndex + 1])
      
      setLoading(false)
    }
    loadMemory()
  }, [params])

  const MessageDisplay = ({ message }: { message: string }) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const maxLength = 300
    const shouldTruncate = message.length > maxLength
    
    if (!shouldTruncate) {
      return <p className="text-gray-700 whitespace-pre-wrap">{message}</p>
    }
    
    return (
      <div>
        <p className="text-gray-700 whitespace-pre-wrap">
          {isExpanded ? message : `${message.slice(0, maxLength)}...`}
        </p>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
        >
          {isExpanded ? 'Read less' : 'Read more'}
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-2">
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
              <li className="text-gray-600 font-medium">
                {loading ? 'Loading...' : memory?.title || memory?.name || 'Memory'}
              </li>
            </ol>
          </nav>

          {/* Navigation Controls */}
          {!loading && (prevMemory || nextMemory) && (
            <div className="flex items-center space-x-2">
              {prevMemory && (
                <Link
                  href={`/memories/${prevMemory.id}`}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  ← Previous
                </Link>
              )}
              {nextMemory && (
                <Link
                  href={`/memories/${nextMemory.id}`}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Next →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading memory...</div>
        </div>
      ) : (
        /* Memory Content */
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold mb-3">{memory.title || memory.name}</h1>
          </div>

          {/* Text Content */}
          {memory.hasText && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <MessageDisplay message={memory.body!} />
            </div>
          )}

          {/* Photos */}
          {memory.hasPhotos && (
            <div>
              <h2 className="text-lg font-medium mb-4">
                Photos ({memory.photos.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {memory.photos.map((photo: any) => (
                  <Link 
                    key={photo.id} 
                    href={`/memories/photos/${photo.id}?from=/memories/${memory.id}`}
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
            </div>
          )}
        </div>
      )}
    </div>
  )
}
