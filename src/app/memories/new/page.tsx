'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import imageCompression from 'browser-image-compression';

export default function NewMemoryPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
    message: string;
  } | null>(null);

  useEffect(() => {
    // Add global callback for Turnstile
    (window as any).turnstileCallback = (token: string) => {
      setTurnstileToken(token);
    };
  }, []);

  // Add Turnstile callback when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).turnstile) {
      (window as any).turnstile.ready(() => {
        (window as any).turnstile.render('.cf-turnstile', {
          sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
          callback: (token: string) => {
            setTurnstileToken(token);
          },
        });
      });
    }
  }, []);

  async function uploadToCloudinary(files: FileList, memoryId: string) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;
    const fileArray = Array.from(files);

    setUploadProgress({
      current: 0,
      total: fileArray.length,
      message: 'Starting uploads...',
    });

    for (let i = 0; i < fileArray.length; i++) {
      const f = fileArray[i];
      let fileToUpload = f;

      // Compress images if they're too large
      if (f.type.startsWith('image/') && f.size > 5 * 1024 * 1024) {
        // 5MB threshold
        try {
          console.log(
            `Compressing ${f.name} (${(f.size / 1024 / 1024).toFixed(1)}MB)`
          );
          fileToUpload = await imageCompression(f, {
            maxSizeMB: 4, // Target 4MB max
            maxWidthOrHeight: 1920, // Max dimension
            useWebWorker: true,
          });
          console.log(
            `Compressed to ${(fileToUpload.size / 1024 / 1024).toFixed(1)}MB`
          );
        } catch (error) {
          console.warn('Compression failed, using original file:', error);
          fileToUpload = f;
        }
      }

      // Update progress for upload
      setUploadProgress({
        current: i + 1,
        total: fileArray.length,
        message: `Uploading ${f.name}...`,
      });

      const fd = new FormData();
      fd.append('file', fileToUpload);
      fd.append('upload_preset', preset);
      // Let Cloudinary determine resource_type automatically
      fd.append('resource_type', 'auto');

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        { method: 'POST', body: fd }
      );
      const json = await res.json();

      if (json.error) {
        throw new Error(`Upload failed: ${json.error.message}`);
      }

      const kind = json.resource_type === 'video' ? 'video' : 'image';
      const publicId = json.public_id;

      // Create Notion record immediately after successful upload
      const photoRes = await fetch('/api/create-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memoryId,
          publicId,
          type: kind,
          caption: undefined, // We can add caption support later
        }),
      });

      if (!photoRes.ok) {
        throw new Error(
          `Failed to create photo record: ${await photoRes.text()}`
        );
      }
    }

    setUploadProgress(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const hasText = body && body.trim().length > 0;
    const hasPhotos = files && files.length > 0;

    if (!hasText && !hasPhotos) {
      setError('Please provide either text or photos for your memory.');
      return;
    }

    // Warn if too many files are selected (increased limit)
    if (files && files.length > 150) {
      setError(
        'Please select 150 or fewer photos/videos. You can create multiple memories if needed.'
      );
      return;
    }

    setSubmitting(true);
    try {
      // Create memory first
      const res = await fetch('/api/submit-memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          title: title || undefined,
          body: hasText ? body : '',
          'cf-turnstile-response': turnstileToken,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      // Upload photos and create Notion records
      if (files && files.length) {
        await uploadToCloudinary(files, data.memoryId);
      }

      // Reset form
      setName('');
      setEmail('');
      setTitle('');
      setBody('');
      setTurnstileToken(null);
      setUploadProgress(null);
      if (document.getElementById('file') as HTMLInputElement) {
        (document.getElementById('file') as HTMLInputElement).value = '';
      }

      // Redirect to the new memory
      window.location.href = `/memories/${data.item.id}`;
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="mb-6">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link
              href="/memories"
              className="text-blue-600 hover:text-blue-800"
            >
              Memories
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-600 font-semibold">Share a memory</li>
        </ol>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-3">Share a memory</h1>
        <p className="text-gray-600 mt-2">
          <span className="font-bold">Share a note, photos, or both.</span> This
          can include condolences, memories, stories, or messages of support.
          Anything you want to share with Paul and his family, or anyone who
          didn't have the chance to know him.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {uploadProgress && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">
                {uploadProgress.message}
              </span>
              <span className="text-sm text-blue-600">
                {uploadProgress.current} of {uploadProgress.total}
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    (uploadProgress.current / uploadProgress.total) * 100
                  }%`,
                }}
              ></div>
            </div>
          </div>
        )}

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Your Name *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Email *
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Your email will only be used to generate a link to your contribution
            and will not be displayed publicly.
          </p>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label
            htmlFor="title"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Title (Optional)
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Optional. If left blank, your name will be used as the title.
          </p>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Give your memory a title"
          />
        </div>

        <div>
          <label
            htmlFor="body"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Memory (Optional)
          </label>
          <p className="text-xs text-gray-500 mb-2">
            You can share just text, just photos, or both. At least one is
            required.
          </p>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Share your memory, story, or message"
          />
        </div>

        <div>
          <label
            htmlFor="file"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Photos / videos (Optional)
          </label>
          <input
            id="file"
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={(e) => setFiles(e.target.files)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Large images are automatically compressed. Videos must be under
            10MB. You can upload up to 150 photos/videos per memory.
          </p>
        </div>

        {/* Turnstile */}
        {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
          <div className="flex justify-start">
            <div
              className="cf-turnstile"
              data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
              data-callback="turnstileCallback"
            />
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Sharing Memory...' : 'Share Memory'}
          </button>
        </div>
      </form>
    </div>
  );
}
