import { createMemory } from '@/lib/data';
import { cldUrl, warmUpImages, getHeroImageUrl, getGridImageUrl } from '@/lib/cloudinary';

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
    };

    console.log('Creating memory with data:', JSON.stringify(detail, null, 2));

    const createdMemory = await createMemory(detail);
    console.log('Memory created successfully with ID:', createdMemory.id);

    // Warm up the most important image URLs for faster first view
    if (createdMemory.photos.length > 0) {
      const warmUpUrls = [
        // Hero image (first photo)
        getHeroImageUrl(createdMemory.photos[0].public_id),
        // Grid images (first few photos)
        ...createdMemory.photos.slice(0, 3).map(photo => getGridImageUrl(photo.public_id))
      ];
      
      // Fire off warm-up requests in background (don't await)
      warmUpImages(warmUpUrls);
      console.log('Warming up', warmUpUrls.length, 'image URLs');
    }

    return Response.json(
      { id: createdMemory.id, updated_at: createdMemory.updated_at },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating memory:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
