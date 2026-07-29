import { createMemory, MemoryStorageError } from '@/lib/data';
import {
  warmUpImages,
  getHeroImageUrl,
  getGridImageUrl,
} from '@/lib/cloudinary';
import { revalidateTag } from 'next/cache';
import { verifyTurnstile } from '@/lib/turnstile';

type PhotoInput = {
  public_id: string;
  caption?: string;
  sort_index?: number;
  taken_at?: string | null;
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    // Validate required fields
    if (!body?.name?.trim()) {
      return new Response('Name is required', { status: 400 });
    }

    if (!body?.email?.trim()) {
      return new Response('Email is required', { status: 400 });
    }

    if (!body?.body?.trim()) {
      return new Response('Memory is required', { status: 400 });
    }

    const captcha = await verifyTurnstile(
      body.turnstileToken,
      req.headers.get('cf-connecting-ip') ??
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    );
    if (!captcha.ok) {
      console.warn('[memory] Turnstile rejected submission:', captcha.reason);
      return new Response(
        "We couldn't verify that you're human. Please reload the page and try again.",
        { status: 403 }
      );
    }

    const photos: PhotoInput[] = (body.photos || [])
      .filter(
        (p: PhotoInput) =>
          typeof p.public_id === 'string' && p.public_id.length > 0
      )
      .sort(
        (a: PhotoInput, b: PhotoInput) =>
          (a.sort_index ?? 0) - (b.sort_index ?? 0)
      );

    const detail = {
      name: String(body.name).slice(0, 100),
      email: String(body.email).slice(0, 100),
      title: body.title?.trim() ? String(body.title).slice(0, 200) : undefined,
      body: String(body.body).slice(0, 5000),
      photos: photos.map((p, i) => ({
        public_id: p.public_id,
        caption: p.caption ?? '',
        taken_at: p.taken_at ?? null,
        sort_index: i,
      })),
      ...(body.created_at && { created_at: body.created_at }),
    };

    console.log(
      `Creating memory from "${detail.name}" with ${detail.photos.length} photo(s)`
    );

    const createdMemory = await createMemory(detail);
    console.log('Memory created successfully with ID:', createdMemory.id);

    // Warm up the most important image URLs for faster first view
    if (createdMemory.photos.length > 0) {
      const warmUpUrls = [
        // Hero image (first photo)
        getHeroImageUrl(createdMemory.photos[0].public_id),
        // Grid images (first few photos)
        ...createdMemory.photos
          .slice(0, 3)
          .map((photo) => getGridImageUrl(photo.public_id)),
      ];

      // Fire off warm-up requests in background (don't await)
      warmUpImages(warmUpUrls);
      console.log('Warming up', warmUpUrls.length, 'image URLs');
    }

    // Re-index photos and memories
    revalidateTag('photos-index');
    revalidateTag('memories-index');

    return Response.json(
      { id: createdMemory.id, updated_at: createdMemory.updated_at },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating memory:', error);

    if (error instanceof MemoryStorageError) {
      return new Response(
        "Your memory couldn't be saved right now — this is a problem on our end, not yours. " +
          'Please copy your text somewhere safe and try again in a few minutes.',
        { status: 503 }
      );
    }

    return new Response(
      'Something went wrong while saving your memory. Please copy your text somewhere safe and try again.',
      { status: 500 }
    );
  }
}
