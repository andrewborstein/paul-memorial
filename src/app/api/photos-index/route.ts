import { NextResponse } from 'next/server';
import { unstable_cache as cache } from 'next/cache';
import pLimit from 'p-limit';
import { aggregateIndex, readMemory } from '@/lib/data';

export const dynamic = 'force-static';
export const revalidate = 300;

type PhotosIndexItem = {
  public_id: string;
  memoryId: string;
  memoryTitle: string;
};

// Cache the *derived* list, tag it so edits invalidate immediately
const buildPhotosIndex = cache(
  async (): Promise<PhotosIndexItem[]> => {
    const index = await aggregateIndex({ forceFresh: false });
    const withPhotos = (index ?? []).filter(
      (m: any) => (m.photo_count ?? 0) > 0
    );

    const limit = pLimit(8);
    const details = await Promise.all(
      withPhotos.map((m: any) =>
        limit(() => readMemory(m.id, { forceFresh: false }))
      )
    );

    const photos: PhotosIndexItem[] = [];
    for (const d of details) {
      if (!d?.photos?.length) continue;
      const title = (d.title || d.name || '').trim();
      for (const p of d.photos) {
        if (!p?.public_id) continue;
        photos.push({
          public_id: p.public_id,
          memoryId: d.id,
          memoryTitle: title,
        });
      }
    }
    return photos;
  },
  ['photos-index-cache-key'],
  { tags: ['photos-index'], revalidate: 300 }
);

export async function GET() {
  const photos = await buildPhotosIndex();
  return NextResponse.json(
    { count: photos.length, photos },
    {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=86400',
      },
    }
  );
}
