'use client'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { useState, useEffect } from 'react'

interface AlbumPageProps {
  params: Promise<{ id: string }>
}

export default function AlbumPage({ params }: AlbumPageProps) {
  const [album, setAlbum] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAlbum() {
      const { id } = await params
      const response = await fetch(`/api/photos/albums/${id}`)
      if (!response.ok) {
        notFound()
      }
      const albumData = await response.json()
      setAlbum(albumData)
      setLoading(false)
    }
    loadAlbum()
  }, [params])

  if (loading) {
    return <div>Loading...</div>
  }

  const MessageDisplay = ({ message }: { message: string }) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const maxLength = 200
    const shouldTruncate = message.length > maxLength
    
    if (!shouldTruncate) {
      return <p className="text-gray-600 mt-2 whitespace-pre-wrap">{message}</p>
    }
    
    return (
      <div className="mt-2">
        <p className="text-gray-600 whitespace-pre-wrap">
          {isExpanded ? message : `${message.slice(0, maxLength)}...`}
        </p>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-1"
        >
          {isExpanded ? 'Read less' : 'Read more'}
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <Link 
          href="/photos/albums"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium mb-4"
        >
          ← Back to Albums
        </Link>
        <h1 className="text-2xl font-semibold mb-3">{album.name}</h1>
        <p className="text-sm text-gray-500 mt-1 font-medium">{album.photoCount} photos</p>
        {album.message && <MessageDisplay message={album.message} />}
      </div>

      {album.photos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No photos in this album.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {album.photos.map((photo: any) => (
            <Link 
              key={photo.id} 
              href={`/photos/${photo.id}?from=/photos/albums/${album.id}`}
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
