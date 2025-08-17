'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function NewMemoryPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedFiles(prev => [...prev, ...files])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // TODO: Implement actual submission logic
    // This would typically involve:
    // 1. Upload photos to Cloudinary or similar service
    // 2. Create a new memory with the form data
    // 3. Redirect to the new memory
    
    setTimeout(() => {
      setIsSubmitting(false)
      alert('Memory creation coming soon!')
    }, 2000)
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="mb-6">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link href="/memories" className="text-blue-600 hover:text-blue-800">
              Memories
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-600 font-medium">Share a memory</li>
        </ol>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Share a memory</h1>
        <p className="text-gray-600 mt-2">Write a note or story, add photos, or both.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Your Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
            Memory *
          </label>
          <textarea
            id="body"
            name="body"
            rows={6}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Share your memory, story, or message..."
          />
          <p className="text-xs text-gray-500 mt-1">
            You can share just text, just photos, or both.
          </p>
        </div>

        <div>
          <label htmlFor="photos" className="block text-sm font-medium text-gray-700 mb-2">
            Photos (Optional)
          </label>
          <input
            type="file"
            id="photos"
            name="photos"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {selectedFiles.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="text-xs text-gray-600">
                  {file.name}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Sharing Memory...' : 'Share Memory'}
          </button>
        </div>
      </form>
    </div>
  )
}
