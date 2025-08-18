'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { MemoryDetail, MemoryPhoto } from '@/types/memory';

interface EditMemoryFormProps {
  memory: MemoryDetail;
}

export default function EditMemoryForm({ memory }: EditMemoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: memory.name,
    email: memory.email,
    title: memory.title || '',
    body: memory.body,
    date: memory.date.split('T')[0], // Convert ISO to date input format
  });
  const [photos, setPhotos] = useState<MemoryPhoto[]>(memory.photos);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/memory/${memory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          photos: photos.map((photo, index) => ({
            public_id: photo.public_id,
            caption: photo.caption,
            taken_at: photo.taken_at,
            sort_index: index,
          })),
        }),
      });

      if (res.ok) {
        router.push(`/memories/${memory.id}`);
        router.refresh();
      } else {
        const error = await res.text();
        alert(`Failed to update memory: ${error}`);
      }
    } catch (error) {
      console.error('Error updating memory:', error);
      alert('Failed to update memory');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const movePhoto = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      setPhotos(prev => {
        const newPhotos = [...prev];
        [newPhotos[index], newPhotos[index - 1]] = [newPhotos[index - 1], newPhotos[index]];
        return newPhotos;
      });
    } else if (direction === 'down' && index < photos.length - 1) {
      setPhotos(prev => {
        const newPhotos = [...prev];
        [newPhotos[index], newPhotos[index + 1]] = [newPhotos[index + 1], newPhotos[index]];
        return newPhotos;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Your Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Your Email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Memory Title (optional)
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Date */}
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          Date
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Memory Text */}
      <div>
        <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">
          Your Memory *
        </label>
        <textarea
          id="body"
          name="body"
          value={formData.body}
          onChange={handleInputChange}
          required
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Share your memory of Paul..."
        />
      </div>

      {/* Existing Photos */}
      {photos.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photos ({photos.length})
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <div key={photo.public_id} className="relative group">
                <img
                  src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_200,h_200,c_fill,q_auto,dpr_2/${photo.public_id}`}
                  alt={photo.caption || 'Photo'}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                    <button
                      type="button"
                      onClick={() => movePhoto(index, 'up')}
                      disabled={index === 0}
                      className="bg-white text-gray-800 p-1 rounded text-xs disabled:opacity-50"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => movePhoto(index, 'down')}
                      disabled={index === photos.length - 1}
                      className="bg-white text-gray-800 p-1 rounded text-xs disabled:opacity-50"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="bg-red-500 text-white p-1 rounded text-xs"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Updating...' : 'Update Memory'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
