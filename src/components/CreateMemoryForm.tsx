'use client';
import React from 'react';
import pLimit from 'p-limit';
import { Turnstile } from '@marsidev/react-turnstile';
import ContactInfoModal from './ContactInfoModal';
import UserStatusDisplay from './UserStatusDisplay';
import { useRouter } from 'next/navigation';
import type { MemoryDetail, MemoryPhoto } from '@/types/memory';
import {
  setCurrentUser,
  getCurrentUser,
  isSignedIn,
  isSuperUser,
  clearSuperUser,
} from '@/lib/user';

type PhotoState = {
  id: string; // Unique identifier
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

// Image resizing utility
function resizeImage(
  file: File,
  maxWidth: number,
  quality: number
): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      const newWidth = img.width * ratio;
      const newHeight = img.height * ratio;

      // Set canvas size
      canvas.width = newWidth;
      canvas.height = newHeight;

      // Draw resized image
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          } else {
            resolve(file); // Fallback to original
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
}

// Photo item component
function PhotoItem({
  photo,
  onDelete,
  imageRefs,
}: {
  photo: PhotoState;
  onDelete: (photo: PhotoState) => void;
  imageRefs: React.MutableRefObject<{ [key: string]: HTMLImageElement }>;
}) {
  return (
    <div className="relative w-fit">
      <div className="relative">
        <img
          ref={(el) => {
            if (el) imageRefs.current[photo.file.name] = el;
          }}
          src={
            photo.status === 'done' && photo.public_id
              ? `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,w_96,h_96,c_fill/${photo.public_id}`
              : photo.preview
          }
          alt=""
          className={`w-24 h-24 object-cover rounded mb-2 ${
            photo.status === 'uploading' || photo.status === 'queued'
              ? 'opacity-50'
              : ''
          }`}
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
            console.log(
              'Is HEIC:',
              photo.file.name.toLowerCase().includes('.heic')
            );
            console.log('Current display style:', img.style.display);

            // If this is a Cloudinary URL and it's a HEIC file, try multiple approaches
            if (
              img.src.includes('cloudinary.com') &&
              photo.file.name.toLowerCase().includes('.heic')
            ) {
              console.log('Retrying HEIC image with different formats...');

              // Try original format first (no conversion)
              if (img.src.includes('f_jpg')) {
                const originalUrl = img.src.replace(
                  'f_jpg,fl_progressive,fl_force_strip,q_auto,w_400',
                  'f_auto,q_auto,w_400'
                );
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
        <div
          className={`hidden w-24 h-24 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500`}
        >
          <div className="text-center">
            <div className="text-lg mb-1">📷</div>
            <div className="text-xs text-gray-400">
              {photo.status === 'done'
                ? 'Loading...'
                : photo.file.type || 'Unknown format'}
            </div>
          </div>
        </div>

        {photo.status === 'uploading' && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
            <div
              className="bg-blue-600 h-1 transition-all duration-300"
              style={{ width: `${photo.progress}%` }}
            />
          </div>
        )}

        {/* Delete button over image */}
        <button
          type="button"
          onClick={() => onDelete(photo)}
          className="absolute top-1 right-1 w-6 h-6 bg-white text-gray-900 rounded-full text-sm font-bold flex items-center justify-center hover:bg-gray-100 border border-gray-300 shadow-sm"
          title="Remove photo"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default function CreateMemoryForm({
  memory,
}: CreateMemoryFormProps = {}) {
  const router = useRouter();
  const isEditMode = !!memory;

  const [name, setName] = React.useState(memory?.name || '');
  const [email, setEmail] = React.useState(memory?.email || '');
  const [title, setTitle] = React.useState(memory?.title || '');
  const [body, setBody] = React.useState(memory?.body || '');
  const [photos, setPhotos] = React.useState<PhotoState[]>(
    memory?.photos.map((photo) => ({
      id: `existing-${photo.public_id}`,
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
  const [showSignInModal, setShowSignInModal] = React.useState(false);
  const [pendingSubmission, setPendingSubmission] = React.useState<
    ((signInName?: string, signInEmail?: string) => void) | null
  >(null);
  const [showTitleField, setShowTitleField] = React.useState(false);
  const [showPhotoModal, setShowPhotoModal] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);

  // Initialize form with current user data if signed in
  React.useEffect(() => {
    if (!isEditMode) {
      const currentUser = getCurrentUser();
      if (currentUser) {
        setName(currentUser.name);
        setEmail(currentUser.email);
      }
    }
  }, [isEditMode]);

  // Auto-resize textarea as content is added
  React.useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(120, textarea.scrollHeight)}px`;
    }
  }, [body]);

  const handleSignIn = (name: string, email: string) => {
    // Store in localStorage first
    setCurrentUser(email, name);

    // Update form state
    setName(name);
    setEmail(email);
    setShowSignInModal(false);
    setErrors([]); // Clear any existing errors

    // Continue with the pending submission after state updates
    if (pendingSubmission) {
      // Use setTimeout to ensure state updates have taken effect
      setTimeout(() => {
        pendingSubmission(name, email);
        setPendingSubmission(null);
      }, 0);
    }
  };
  const errorRef = React.useRef<HTMLDivElement>(null);
  const imageRefs = React.useRef<{ [key: string]: HTMLImageElement }>({});
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const items = files.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: 'queued' as const,
    }));
    setPhotos((prev) => [...prev, ...items]);

    // Auto-upload the new files
    uploadNewFiles(items);

    // Open the modal to show upload progress
    setShowPhotoModal(true);
  }

  function uploadNewFiles(newPhotos: PhotoState[]) {
    const limit = pLimit(4);
    newPhotos.forEach((photo) =>
      limit(async () => {
        try {
          const pid = await uploadOne(photo);
          // For HEIC files, force JPEG conversion
          const isHeic =
            photo.file.name.toLowerCase().includes('.heic') ||
            photo.file.name.toLowerCase().includes('.heif');
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
                    preview: cloudinaryUrl,
                  }
                : p
            );
            console.log(
              'Updated photos state with Cloudinary URL:',
              updated.find((p) => p.file.name === photo.file.name)?.preview
            );
            return updated;
          });

          // Force the image element to be visible for the new Cloudinary URL
          setTimeout(() => {
            const imgElement = imageRefs.current[photo.file.name];
            if (imgElement) {
              console.log(
                "Found image element via ref, ensuring it's visible for Cloudinary URL"
              );
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
              console.log(
                'Image element not found in refs for:',
                photo.file.name
              );
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

  async function uploadOne(ps: PhotoState): Promise<string> {
    // Resize large images before upload
    let fileToUpload = ps.file;
    if (ps.file.size > 10 * 1024 * 1024) {
      // 10MB limit
      console.log('Resizing large image:', ps.file.name, 'Size:', ps.file.size);
      fileToUpload = await resizeImage(ps.file, 1920, 0.8); // Max 1920px width, 80% quality
    }

    const fd = new FormData();
    fd.append('file', fileToUpload);
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

    if (!body.trim()) {
      newErrors.push('Please include a memory before publishing');
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
    // Always validate form first
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      // Scroll to errors after state update
      setTimeout(scrollToErrors, 100);
      return; // Don't show sign-in modal for invalid forms
    }

    // Check if user is signed in or is super user
    const currentUser = getCurrentUser();
    const isSuper = isSuperUser();
    console.log('onPublish: Current user:', currentUser);
    console.log('onPublish: isSignedIn():', isSignedIn());
    console.log('onPublish: isSuperUser():', isSuper);
    console.log('onPublish: Form email:', email);
    console.log('onPublish: Form name:', name);

    if (!isSignedIn() && !isSuper) {
      console.log(
        'onPublish: User not signed in and not super user, showing sign-in modal'
      );
      setShowSignInModal(true);
      // Create a closure that captures current form state and will receive sign-in values
      setPendingSubmission(() => {
        return async (signInName?: string, signInEmail?: string) => {
          // Re-validate and submit with current state
          const validationErrors = validateForm();
          if (validationErrors.length > 0) {
            setErrors(validationErrors);
            setTimeout(scrollToErrors, 100);
            return;
          }
          await submitMemory(signInName, signInEmail);
        };
      });
      return;
    }

    console.log('onPublish: User is signed in, proceeding with submit');
    await submitMemory();
  }

  async function submitMemory(signInName?: string, signInEmail?: string) {
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

    // Use sign-in values if provided, otherwise use current state
    const finalName = signInName || name;
    const finalEmail = signInEmail || email;

    console.log(
      'Submitting payload with name:',
      finalName,
      'email:',
      finalEmail
    );
    console.log(
      'Name length:',
      finalName?.length,
      'Email length:',
      finalEmail?.length
    );
    const payload = {
      name: finalName,
      email: finalEmail,
      title: title.trim() || undefined, // Only send if not empty
      body,
      // date field removed - using created_at and updated_at instead
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
      setErrors([
        errorText || `Failed to ${isEditMode ? 'update' : 'publish'} memory`,
      ]);
      setIsPublishing(false);
      // Scroll to errors after state update
      setTimeout(scrollToErrors, 100);
      return;
    }

    const { id, updated_at } = await r.json();

    if (isEditMode) {
      // Force hard reload to memory page to clear any cached photo URLs
      window.location.replace(`/memories/${id}?t=${updated_at}`);
    } else {
      // Redirect to memories page with updated_at timestamp for cache busting
      window.location.href = `/memories?t=${updated_at}`;
    }
  }

  return (
    <>
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        {/* Validation Errors */}
        {errors.length > 0 && (
          <div
            ref={errorRef}
            tabIndex={-1}
            className="bg-red-50 border border-red-200 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <div className="text-red-700 text-sm">{errors[0]}</div>
          </div>
        )}

        {/* User Status Display */}
        <UserStatusDisplay
          onEditContactInfo={() => {
            setShowSignInModal(true);
            setPendingSubmission(null);
          }}
        />

        {/* Super User Warning */}
        {!isEditMode && isSuperUser() && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-amber-800">
                  Super User Mode Active
                </h3>
                <p className="text-sm text-amber-700 mt-1">
                  You're currently in super user mode. To share a memory as
                  yourself, please{' '}
                  <button
                    type="button"
                    onClick={() => {
                      clearSuperUser();
                      window.location.reload();
                    }}
                    className="text-amber-800 underline hover:text-amber-900 font-medium"
                  >
                    exit super user mode
                  </button>{' '}
                  and sign in with your personal account.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Title Field - Hidden by default, expandable */}
        {showTitleField && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="title"
                className="block text-sm font-semibold text-gray-700"
              >
                Title (Optional)
              </label>
              <button
                type="button"
                onClick={() => setShowTitleField(false)}
                className="text-sm text-gray-500 hover:text-gray-700 uppercase tracking-widest text-xs"
              >
                Hide
              </button>
            </div>
            <input
              id="title"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Give your memory a title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              autoFocus
            />
          </div>
        )}

        {/* Memory input with integrated actions */}
        <div className="border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
          <textarea
            ref={textareaRef}
            id="body"
            className="w-full px-3 py-2 border-0 rounded-md focus:outline-none focus:ring-0 resize-y min-h-[120px]"
            placeholder="What will you remember about Paul?"
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              // Clear errors when user starts typing
              if (errors.length > 0) {
                setErrors([]);
              }
            }}
            rows={3}
            required
          />

          {/* Integrated action buttons - like Facebook */}
          <div className="border-t border-gray-200 px-3 py-2 bg-gray-50 rounded-b-md">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 font-medium">
                Add to your memory:
              </span>
              <div className="flex items-center gap-2">
                {/* Title button */}
                <button
                  type="button"
                  onClick={() => setShowTitleField(!showTitleField)}
                  className={`flex items-center gap-1 px-2 py-1.5 text-xs rounded-md transition-colors shadow-sm whitespace-nowrap uppercase tracking-widest ${
                    title.trim()
                      ? 'bg-green-50 border border-green-600 text-green-800 hover:bg-green-100'
                      : 'btn-secondary'
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Title
                  {title.trim() && (
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>

                {/* Photos button with count */}
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
                  onClick={() => {
                    if (photos.length > 0) {
                      setShowPhotoModal(true);
                    } else {
                      document.getElementById('photos')?.click();
                    }
                  }}
                  disabled={photos.some(
                    (p) => p.status === 'uploading' || p.status === 'queued'
                  )}
                  className={`flex items-center gap-1 px-2 py-1.5 text-xs rounded-md transition-colors shadow-sm whitespace-nowrap uppercase tracking-widest ${
                    photos.length > 0
                      ? 'bg-green-50 border border-green-600 text-green-800 hover:bg-green-100'
                      : 'btn-secondary'
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {photos.length > 0 ? `Photos (${photos.length})` : 'Photos'}
                  {photos.length > 0 && (
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            className="btn disabled:opacity-50"
            disabled={
              isPublishing ||
              photos.some(
                (p) =>
                  p.status === 'uploading' ||
                  p.status === 'queued' ||
                  p.status === 'error'
              )
            }
            onClick={() => onPublish()}
          >
            {isPublishing
              ? isEditMode
                ? 'Updating...'
                : 'Publishing...'
              : photos.some(
                    (p) => p.status === 'uploading' || p.status === 'queued'
                  )
                ? 'Uploading photos...'
                : isEditMode
                  ? 'Update'
                  : 'Publish'}
          </button>

          {isEditMode && (
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Turnstile - only show in create mode */}
        {!isEditMode && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
          <div className="hidden">
            <Turnstile
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
              onSuccess={(token) => setTurnstileToken(token)}
            />
          </div>
        )}
      </form>

      {/* Photo Management Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Add Photos</h3>
              <button
                type="button"
                onClick={() => setShowPhotoModal(false)}
                disabled={photos.some(
                  (p) => p.status === 'uploading' || p.status === 'queued'
                )}
                className={`text-gray-500 hover:text-gray-700 ${
                  photos.some(
                    (p) => p.status === 'uploading' || p.status === 'queued'
                  )
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-4">
              {/* Uploading indicator */}
              {photos.some(
                (p) => p.status === 'uploading' || p.status === 'queued'
              ) && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center gap-2 text-blue-700">
                    <div className="w-4 h-4 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-medium">
                      {photos.filter((p) => p.status === 'uploading').length}{' '}
                      uploading
                      {photos.filter((p) => p.status === 'queued').length >
                        0 && (
                        <>
                          , {photos.filter((p) => p.status === 'queued').length}{' '}
                          queued
                        </>
                      )}
                    </span>
                  </div>
                </div>
              )}

              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 96px))',
                }}
              >
                {photos.map((p) => (
                  <PhotoItem
                    key={p.id}
                    photo={p}
                    onDelete={deletePhoto}
                    imageRefs={imageRefs}
                  />
                ))}
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex gap-2 items-center">
                  <input
                    id="photos-modal"
                    type="file"
                    multiple
                    accept="image/*,video/*,.heic,.HEIC,.heif,.HEIF"
                    onChange={onSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPhotoModal(false)}
                    disabled={photos.some(
                      (p) => p.status === 'uploading' || p.status === 'queued'
                    )}
                    className="btn disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Done
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById('photos-modal')?.click()
                    }
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 uppercase tracking-widest text-xs"
                  >
                    + Add more photos
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Info Modal - outside the form to avoid nested forms */}
      <ContactInfoModal
        isOpen={showSignInModal}
        onClose={() => {
          setShowSignInModal(false);
          setPendingSubmission(null);
        }}
        onSubmit={handleSignIn}
        title="Contact info"
        description="Enter a valid email to create and edit your memories."
      />
    </>
  );
}
