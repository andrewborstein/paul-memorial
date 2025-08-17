'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function UploadPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    // TODO: Implement actual upload logic
    // This would typically involve:
    // 1. Upload to Cloudinary or similar service
    // 2. Create a new memory/tribute with the photos
    // 3. Redirect to the new album

    setTimeout(() => {
      setIsUploading(false);
      alert('Upload functionality coming soon!');
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/photos"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium mb-4"
        >
          ← Back to Photos
        </Link>
        <h1 className="text-2xl font-semibold mb-3">Upload Photos</h1>
        <p className="text-gray-600 mt-2">Share photos with your memories</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Your Name
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
          <label
            htmlFor="photos"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select Photos
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

        {uploadedFiles.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Selected Files:
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="text-xs text-gray-600">
                  {file.name}
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label
            htmlFor="caption"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Caption (Optional)
          </label>
          <textarea
            id="caption"
            name="caption"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add a caption or memory..."
          />
        </div>

        <button
          type="submit"
          disabled={isUploading || uploadedFiles.length === 0}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? 'Uploading...' : 'Upload Photos'}
        </button>
      </form>
    </div>
  );
}
