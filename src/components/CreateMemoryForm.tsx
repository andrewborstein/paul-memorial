'use client';
import React from 'react';
import pLimit from 'p-limit';
import { Turnstile } from '@marsidev/react-turnstile';

type PhotoState = {
  file: File;
  preview: string;
  progress: number; // 0..100
  status: 'queued' | 'uploading' | 'done' | 'error';
  public_id?: string;
  caption?: string;
};

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

export default function CreateMemoryForm() {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState('');
  const [photos, setPhotos] = React.useState<PhotoState[]>([]);
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [turnstileToken, setTurnstileToken] = React.useState<string | null>(
    null
  );
  const [errors, setErrors] = React.useState<string[]>([]);
  const errorRef = React.useRef<HTMLDivElement>(null);

  function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const items = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: 'queued' as const,
    }));
    setPhotos((prev) => [...prev, ...items]);

    // Auto-upload the new files
    uploadNewFiles(items);
  }

  function uploadNewFiles(newPhotos: PhotoState[]) {
    const limit = pLimit(4);
    newPhotos.forEach((photo) =>
      limit(async () => {
        try {
          const pid = await uploadOne(photo);
          // For HEIC files, force JPEG conversion
          const isHeic = photo.file.name.toLowerCase().includes('.heic') || photo.file.name.toLowerCase().includes('.heif');
          const cloudinaryUrl = isHeic 
            ? `https://res.cloudinary.com/${CLOUD}/image/upload/f_jpg,fl_progressive,fl_force_strip,q_auto,w_400/${pid}`
            : `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,w_400/${pid}`;
          console.log('Generated Cloudinary URL:', cloudinaryUrl);
          console.log('File type:', photo.file.type);
          console.log('File name:', photo.file.name);
          
          setPhotos((prev) =>
            prev.map((p) =>
              p === photo
                ? { 
                    ...p, 
                    public_id: pid, 
                    progress: 100, 
                    status: 'done',
                    preview: cloudinaryUrl
                  }
                : p
            )
          );
        } catch {
          setPhotos((prev) =>
            prev.map((p) => (p === photo ? { ...p, status: 'error' } : p))
          );
        }
      })
    );
  }

  function deletePhoto(photoToDelete: PhotoState) {
    console.log('deletePhoto called for:', photoToDelete.file.name);
    console.log('photoToDelete:', photoToDelete);

    // If photo was uploaded to Cloudinary, delete it
    if (photoToDelete.public_id) {
      console.log(
        'Deleting from Cloudinary with public_id:',
        photoToDelete.public_id
      );
      deleteFromCloudinary(photoToDelete.public_id);
    } else {
      console.log('No public_id found, skipping Cloudinary deletion');
    }

    // Remove from local state
    setPhotos((prev) => {
      console.log('Removing from photos state:', photoToDelete.file.name);
      return prev.filter((p) => p !== photoToDelete);
    });

    // Clean up preview URL
    URL.revokeObjectURL(photoToDelete.preview);
  }

  async function deleteFromCloudinary(publicId: string) {
    try {
      console.log(`Deleting from Cloudinary via API: ${publicId}`);

      const response = await fetch('/api/delete-photo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ public_id: publicId }),
      });

      if (response.ok) {
        console.log(`Successfully deleted from Cloudinary: ${publicId}`);
      } else {
        const errorText = await response.text();
        console.error(
          `Failed to delete from Cloudinary: ${response.status} ${errorText}`
        );
      }
    } catch (error) {
      console.warn('Failed to delete from Cloudinary:', error);
    }
  }

  function reorder(from: number, to: number) {
    setPhotos((prev) => {
      const next = prev.slice();
      const [m] = next.splice(from, 1);
      next.splice(to, 0, m);
      return next;
    });
  }

  async function uploadOne(ps: PhotoState): Promise<string> {
    const fd = new FormData();
    fd.append('file', ps.file);
    fd.append('upload_preset', PRESET);
    fd.append('folder', 'memories');

    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD}/upload`);

      // Set initial status to uploading
      console.log(`Starting upload for ${ps.file.name}`);
      setPhotos((prev) => {
        const updated = prev.map((p) =>
          p.file.name === ps.file.name
            ? { ...p, status: 'uploading' as const, progress: 0 }
            : p
        );
        console.log(
          'Updated photos state:',
          updated.map((p) => ({ name: p.file.name, status: p.status }))
        );
        return updated;
      });

      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable) {
          const pct = Math.round((evt.loaded / evt.total) * 100);
          console.log(`Upload progress for ${ps.file.name}: ${pct}%`);
          setPhotos((prev) =>
            prev.map((p) =>
              p.file.name === ps.file.name
                ? { ...p, progress: pct, status: 'uploading' }
                : p
            )
          );
        }
      };

      xhr.onreadystatechange = () => {
        if (xhr.readyState !== 4) return;
        if (xhr.status >= 200 && xhr.status < 300) {
          const res = JSON.parse(xhr.responseText);
          console.log(`Upload completed for ${ps.file.name}`);
          // Set progress to 100% when complete and save public_id
          setPhotos((prev) => {
            const updated = prev.map((p) =>
              p.file.name === ps.file.name
                ? {
                    ...p,
                    progress: 100,
                    status: 'done' as const,
                    public_id: res.public_id,
                  }
                : p
            );
            console.log(
              'Final photos state:',
              updated.map((p) => ({
                name: p.file.name,
                status: p.status,
                public_id: p.public_id,
              }))
            );
            return updated;
          });
          resolve(res.public_id as string);
        } else {
          console.error(
            `Upload failed for ${ps.file.name}:`,
            xhr.status,
            xhr.responseText
          );
          setPhotos((prev) =>
            prev.map((p) =>
              p.file.name === ps.file.name ? { ...p, status: 'error' } : p
            )
          );
          reject(new Error('Upload failed'));
        }
      };

      xhr.onerror = () => {
        console.error(`Upload error for ${ps.file.name}`);
        setPhotos((prev) =>
          prev.map((p) =>
            p.file.name === ps.file.name ? { ...p, status: 'error' } : p
          )
        );
        reject(new Error('Upload failed'));
      };

      xhr.send(fd);
    });
  }

  function validateForm(): string[] {
    const newErrors: string[] = [];

    if (!name.trim()) {
      newErrors.push('Name is required');
    }

    if (!email.trim()) {
      newErrors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.push('Please enter a valid email address');
    }

    if (!body.trim()) {
      newErrors.push('Memory is required');
    }

    return newErrors;
  }

  function scrollToErrors() {
    if (errorRef.current) {
      errorRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      // Focus the error container for screen readers
      errorRef.current.focus();
    }
  }

  async function onPublish() {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      // Scroll to errors after state update
      setTimeout(scrollToErrors, 100);
      return;
    }

    // Check if any photos are still uploading or failed
    const uploadingPhotos = photos.filter(
      (p) => p.status === 'uploading' || p.status === 'queued'
    );
    if (uploadingPhotos.length > 0) {
      setErrors(['Please wait for all photos to finish uploading']);
      setTimeout(scrollToErrors, 100);
      return;
    }

    // Check if any photos failed to upload
    const failedPhotos = photos.filter((p) => p.status === 'error');
    if (failedPhotos.length > 0) {
      setErrors([
        'Some photos failed to upload. Please remove them or try again.',
      ]);
      setTimeout(scrollToErrors, 100);
      return;
    }

    setErrors([]);
    setIsPublishing(true);

    const payload = {
      name,
      email,
      title: title.trim() || undefined, // Only send if not empty
      body,
      date: new Date().toISOString(),
      photos: photos
        .map((p, i) => ({
          public_id: p.public_id!,
          caption: p.caption ?? '',
          sort_index: i,
        }))
        .filter((p) => !!p.public_id),
      turnstileToken,
    };

    const r = await fetch('/api/memory', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const errorText = await r.text();
      setErrors([errorText || 'Failed to publish memory']);
      setIsPublishing(false);
      // Scroll to errors after state update
      setTimeout(scrollToErrors, 100);
      return;
    }

    const { id } = await r.json();
    window.location.href = `/memories/${id}`;
  }

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      {/* Validation Errors */}
      {errors.length > 0 && (
        <div
          ref={errorRef}
          tabIndex={-1}
          className="bg-red-50 border border-red-200 rounded-md p-4 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <div className="text-red-800 text-sm font-medium mb-2">
            Please fix the following errors:
          </div>
          <ul className="text-red-700 text-sm space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
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
          id="name"
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
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
          id="email"
          type="email"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
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
          id="title"
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Give your memory a title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
        />
      </div>

      <div>
        <label
          htmlFor="body"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Memory *
        </label>
        <textarea
          id="body"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Share your memory, story, or message"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Photos / videos (Optional)
        </label>
        <input
          id="photos"
          type="file"
          multiple
          accept="image/*,video/*,.heic,.HEIC,.heif,.HEIF"
          onChange={onSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => document.getElementById('photos')?.click()}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 border border-gray-300"
        >
          Add photos
        </button>
        <p className="text-xs text-gray-500 mt-1">
          Large images are automatically compressed. Videos must be under 10MB.
          You can upload up to 150 photos/videos per memory. HEIC files are supported and will be converted automatically.
        </p>
      </div>

      {/* Photo Preview Grid */}
      {photos.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Photo Preview
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map((p, i) => (
              <div key={i} className="border rounded-lg p-2 relative">
                <div className="relative">
                  <img
                    src={p.preview}
                    alt=""
                    className={`w-full h-24 object-cover rounded mb-2 ${
                      p.status === 'uploading' ? 'opacity-50' : ''
                    }`}
                    onError={(e) => {
                      // Fallback for unsupported formats (HEIC, etc.)
                      const target = e.target as HTMLImageElement;
                      const img = target as HTMLImageElement;
                      
                      console.log('Image load failed:', img.src);
                      console.log('File name:', p.file.name);
                      console.log('Is HEIC:', p.file.name.toLowerCase().includes('.heic'));
                      
                      // If this is a Cloudinary URL and it's a HEIC file, try multiple approaches
                      if (img.src.includes('cloudinary.com') && p.file.name.toLowerCase().includes('.heic')) {
                        console.log('Retrying HEIC image with different formats...');
                        
                        // Try original format first (no conversion)
                        if (img.src.includes('f_jpg')) {
                          const originalUrl = img.src.replace('f_jpg,fl_progressive,fl_force_strip,q_auto,w_400', 'f_auto,q_auto,w_400');
                          console.log('Trying original format:', originalUrl);
                          img.src = originalUrl;
                          return;
                        }
                        
                        // If original format fails, try with delay
                        setTimeout(() => {
                          console.log('Retrying image load with cache bust:', img.src);
                          img.style.display = 'block';
                          img.src = img.src + '?t=' + Date.now(); // Force reload
                        }, 2000);
                        return;
                      }
                      
                      // Otherwise show fallback
                      console.log('Showing fallback for:', p.file.name);
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  
                  {/* Fallback for unsupported formats */}
                  <div className={`hidden w-full h-24 bg-gray-100 rounded mb-2 flex items-center justify-center text-xs text-gray-500`}>
                    <div className="text-center">
                      <div className="text-lg mb-1">📷</div>
                      <div className="truncate max-w-full px-1">{p.file.name}</div>
                      <div className="text-xs text-gray-400">
                        {p.file.type || 'Unknown format'}
                      </div>
                      {p.status === 'uploading' && (
                        <div className="text-xs text-blue-600 mt-1">Converting...</div>
                      )}
                    </div>
                  </div>
                  
                  {p.status === 'uploading' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-600 mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={i === 0}
                      onClick={() => reorder(i, i - 1)}
                      className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                      title="Move image up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={i === photos.length - 1}
                      onClick={() => reorder(i, i + 1)}
                      className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                      title="Move image down"
                    >
                      ↓
                    </button>
                  </div>
                  <span>
                    {p.status === 'uploading' ? (
                      `${p.progress}%`
                    ) : p.status === 'error' ? (
                      <span className="text-red-600">✗ error</span>
                    ) : p.status === 'done' ? (
                      <button
                        type="button"
                        onClick={() => deletePhoto(p)}
                        className="inline-flex items-center justify-center w-6 h-6 bg-red-50 text-red-700 rounded-full text-xs hover:bg-red-100 border border-red-300"
                        title="Remove image"
                      >
                        <span className="text-sm font-bold">×</span>
                      </button>
                    ) : (
                      p.status
                    )}
                  </span>
                </div>
                {p.status === 'uploading' && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Turnstile */}
      {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
        <div className="flex justify-start">
          <Turnstile
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            onSuccess={(token) => setTurnstileToken(token)}
          />
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="button"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={
            isPublishing ||
            photos.some(
              (p) =>
                p.status === 'uploading' ||
                p.status === 'queued' ||
                p.status === 'error'
            )
          }
          onClick={onPublish}
        >
          {isPublishing
            ? 'Publishing...'
            : photos.some(
                  (p) => p.status === 'uploading' || p.status === 'queued'
                )
              ? 'Uploading photos...'
              : 'Publish memory'}
        </button>
      </div>
    </form>
  );
}
