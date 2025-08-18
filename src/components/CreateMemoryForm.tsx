'use client';
import React from 'react';
import pLimit from 'p-limit';
import { Turnstile } from '@marsidev/react-turnstile';
import { useRouter } from 'next/navigation';
import type { MemoryDetail, MemoryPhoto } from '@/types/memory';
import { setCurrentUser } from '@/lib/user';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type PhotoState = {
  file: File;
  preview: string;
  progress: number; // 0..100
  status: 'queued' | 'uploading' | 'done' | 'error';
  public_id?: string;
  caption?: string;
};

interface CreateMemoryFormProps {
  memory?: MemoryDetail; // Optional - if provided, we're in edit mode
}

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

// Sortable photo item component
function SortablePhotoItem({ 
  photo, 
  index, 
  onReorder, 
  onDelete, 
  imageRefs,
  totalPhotos
}: { 
  photo: PhotoState; 
  index: number; 
  onReorder: (from: number, to: number) => void;
  onDelete: (photo: PhotoState) => void;
  imageRefs: React.MutableRefObject<{ [key: string]: HTMLImageElement }>;
  totalPhotos: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.file.name });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="border rounded-lg p-2 relative w-fit"
    >
      <div className="relative">
        <img
          ref={(el) => {
            if (el) imageRefs.current[photo.file.name] = el;
          }}
          src={photo.preview}
          alt=""
                                className={`w-32 h-32 object-cover rounded mb-2 cursor-grab active:cursor-grabbing ${
            photo.status === 'uploading' || photo.status === 'queued' ? 'opacity-50' : ''
          }`}
          {...attributes}
          {...listeners}
          onLoad={(e) => {
            console.log('Image loaded successfully:', photo.file.name);
            const target = e.target as HTMLImageElement;
            target.style.display = 'block';
            target.nextElementSibling?.classList.add('hidden');
          }}
          onError={(e) => {
            // Fallback for unsupported formats (HEIC, etc.)
            const target = e.target as HTMLImageElement;
            const img = target as HTMLImageElement;
            
            console.log('Image load failed:', img.src);
            console.log('File name:', photo.file.name);
            console.log('Is HEIC:', photo.file.name.toLowerCase().includes('.heic'));
            console.log('Current display style:', img.style.display);
            
            // If this is a Cloudinary URL and it's a HEIC file, try multiple approaches
            if (img.src.includes('cloudinary.com') && photo.file.name.toLowerCase().includes('.heic')) {
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
            console.log('Showing fallback for:', photo.file.name);
            target.style.display = 'none';
            const fallback = target.nextElementSibling;
            if (fallback) {
              fallback.classList.remove('hidden');
              console.log('Fallback element found and shown');
            } else {
              console.log('No fallback element found!');
            }
          }}
        />
        
        {/* Fallback for unsupported formats */}
        <div className={`hidden w-32 h-32 bg-gray-100 rounded mb-2 flex items-center justify-center text-xs text-gray-500`}>
          <div className="text-center">
            <div className="text-lg mb-1">📷</div>
            <div className="truncate max-w-full px-1">
              {photo.public_id ? photo.public_id.split('/').pop() : photo.file.name}
            </div>
            <div className="text-xs text-gray-400">
              {photo.status === 'done' ? 'Loading...' : (photo.file.type || 'Unknown format')}
            </div>
            {photo.status === 'uploading' && (
              <div className="text-xs text-blue-600 mt-1">Converting...</div>
            )}
          </div>
        </div>
        
        {photo.status === 'uploading' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        )}
      </div>
      <div className="text-xs text-gray-600 mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onReorder(index, index - 1)}
            className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
            title="Move image up"
          >
            ↑
          </button>
          <button
            type="button"
            disabled={index === totalPhotos - 1}
            onClick={() => onReorder(index, index + 1)}
            className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
            title="Move image down"
          >
            ↓
          </button>
        </div>
        <span>
          {photo.status === 'uploading' ? (
            `${photo.progress}%`
          ) : photo.status === 'error' ? (
            <span className="text-red-600">✗ error</span>
          ) : photo.status === 'done' ? (
            <button
              type="button"
              onClick={() => onDelete(photo)}
              className="inline-flex items-center justify-center w-6 h-6 bg-red-50 text-red-700 rounded-full text-xs hover:bg-red-100 border border-red-300"
              title="Remove image"
            >
              <span className="text-sm font-bold">×</span>
            </button>
          ) : photo.status === 'queued' ? (
            <span className="text-gray-400">...</span>
          ) : (
            photo.status
          )}
        </span>
      </div>
      {photo.status === 'uploading' && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-blue-600 h-1 rounded-full transition-all duration-300"
              style={{ width: `${photo.progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreateMemoryForm({ memory }: CreateMemoryFormProps = {}) {
  const router = useRouter();
  const isEditMode = !!memory;
  
  const [name, setName] = React.useState(memory?.name || '');
  const [email, setEmail] = React.useState(memory?.email || '');
  const [title, setTitle] = React.useState(memory?.title || '');
  const [body, setBody] = React.useState(memory?.body || '');
  const [photos, setPhotos] = React.useState<PhotoState[]>(
    memory?.photos.map(photo => ({
      file: new File([], photo.public_id), // Dummy file for existing photos
      preview: `https://res.cloudinary.com/${CLOUD}/image/upload/f_jpg,fl_progressive,fl_force_strip,w_200,h_200,c_fill,q_auto,dpr_2/${photo.public_id}`,
      progress: 100,
      status: 'done' as const,
      public_id: photo.public_id,
      caption: photo.caption,
    })) || []
  );
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [turnstileToken, setTurnstileToken] = React.useState<string | null>(
    null
  );
  const [errors, setErrors] = React.useState<string[]>([]);
  const errorRef = React.useRef<HTMLDivElement>(null);
  const imageRefs = React.useRef<{ [key: string]: HTMLImageElement }>({});

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
          
          setPhotos((prev) => {
            const updated = prev.map((p) =>
              p === photo
                ? { 
                    ...p, 
                    public_id: pid, 
                    progress: 100, 
                    status: 'done' as const,
                    preview: cloudinaryUrl
                  }
                : p
            );
            console.log('Updated photos state with Cloudinary URL:', updated.find(p => p.file.name === photo.file.name)?.preview);
            return updated;
          });
          
          // Force the image element to be visible for the new Cloudinary URL
          setTimeout(() => {
            const imgElement = imageRefs.current[photo.file.name];
            if (imgElement) {
              console.log('Found image element via ref, ensuring it\'s visible for Cloudinary URL');
              console.log('Current image src:', imgElement.src);
              console.log('Expected Cloudinary URL:', cloudinaryUrl);
              imgElement.style.display = 'block';
              imgElement.nextElementSibling?.classList.add('hidden');
              
              // Force update the src if it's still the blob URL
              if (imgElement.src.startsWith('blob:')) {
                console.log('Forcing src update to Cloudinary URL');
                imgElement.src = cloudinaryUrl;
              }
            } else {
              console.log('Image element not found in refs for:', photo.file.name);
            }
          }, 100);
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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setPhotos((items) => {
        const oldIndex = items.findIndex(item => item.file.name === active.id);
        const newIndex = items.findIndex(item => item.file.name === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
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
      date: isEditMode ? memory!.date : new Date().toISOString(),
      photos: photos
        .map((p, i) => ({
          public_id: p.public_id!,
          caption: p.caption ?? '',
          sort_index: i,
        }))
        .filter((p) => !!p.public_id),
      ...(isEditMode ? {} : { turnstileToken }),
    };

    const url = isEditMode ? `/api/memory/${memory!.id}` : '/api/memory';
    const method = isEditMode ? 'PUT' : 'POST';

    const r = await fetch(url, {
      method,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const errorText = await r.text();
      setErrors([errorText || `Failed to ${isEditMode ? 'update' : 'publish'} memory`]);
      setIsPublishing(false);
      // Scroll to errors after state update
      setTimeout(scrollToErrors, 100);
      return;
    }

    const { id } = await r.json();
    
    // Set current user in localStorage when creating a new memory
    if (!isEditMode) {
      setCurrentUser(email, name);
    }
    
    if (isEditMode) {
      router.push(`/memories/${id}`);
      router.refresh();
    } else {
      window.location.href = `/memories/${id}`;
    }
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={photos.map(p => p.file.name)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-wrap gap-2">
                {photos.map((p, i) => (
                  <SortablePhotoItem
                    key={p.file.name}
                    photo={p}
                    index={i}
                    onReorder={reorder}
                    onDelete={deletePhoto}
                    imageRefs={imageRefs}
                    totalPhotos={photos.length}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Turnstile - only show in create mode */}
      {!isEditMode && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
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
            ? (isEditMode ? 'Updating...' : 'Publishing...')
            : photos.some(
                  (p) => p.status === 'uploading' || p.status === 'queued'
                )
              ? 'Uploading photos...'
              : (isEditMode ? 'Update Memory' : 'Publish Memory')}
        </button>
        
        {isEditMode && (
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
