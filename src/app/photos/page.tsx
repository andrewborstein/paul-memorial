'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import PageHeader from '@/components/PageHeader';
import ImageWithFallback from '@/components/ImageWithFallback';
import SquareThumb from '@/components/SquareThumb';

type PhotosIndexItem =
  | string
  | {
      public_id: string;
      memoryId?: string;
      memoryTitle?: string;
    };

function PhotoSkeleton() {
  return (
    <div className="aspect-square rounded-lg bg-gray-200/60 animate-pulse" />
  );
}

export default function PhotosPage() {
  const [photos, setPhotos] = useState<PhotosIndexItem[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        // Browser can use a relative URL. The API itself should be ISR/edge-cached.
        const res = await fetch('/api/photos-index', {
          signal: ac.signal,
          cache: 'no-store', // browser won't cache; edge cache still applies
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setPhotos(Array.isArray(json?.photos) ? json.photos : []);
      } catch (e: any) {
        if (e?.name !== 'AbortError')
          setErr(e?.message ?? 'Failed to load photos');
      }
    })();

    return () => ac.abort();
  }, []);

  const displayPhotos = useMemo(() => (photos ?? []).slice(0, 10), [photos]);
  const hasMorePhotos = (photos?.length ?? 0) > 10;

  return (
    <PageContainer>
      <PageHeader
        title="Photos"
        description="Browse all photos shared in memories."
      />

      {err ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Unable to load photos.</p>
        </div>
      ) : photos === null ? (
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-semibold mb-4">All photos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <PhotoSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No photos shared yet.</p>
          <Link
            href="/memories/new"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Be the first to share photos
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-semibold mb-4">
              All photos ({photos.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {displayPhotos.map((photo, index) => {
                const id = typeof photo === 'string' ? photo : photo.public_id;
                if (!id) return null;

                return (
                  <Link
                    key={id}
                    href={`/memories/photos/${id}`}
                    className="block"
                  >
                    <SquareThumb
                      publicId={id}
                      alt={`Photo ${index + 1} of ${photos.length}`}
                      className="overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </Link>
                );
              })}
            </div>

            {hasMorePhotos && (
              <div className="text-center mt-6">
                <Link
                  href="/photos/all"
                  className="text-blue-600 hover:text-blue-800 font-semibold uppercase tracking-widest text-xs "
                >
                  Load all {photos.length} photos
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
