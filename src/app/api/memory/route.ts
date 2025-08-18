import { nanoid } from 'nanoid';
import { readIndex, writeIndex, writeMemory } from '@/lib/data';
import { cldUrl } from '@/lib/cloudinary';
import { revalidatePath } from 'next/cache';

type PhotoInput = {
  public_id: string;
  caption?: string;
  sort_index?: number;
  taken_at?: string | null;
};

export async function POST(req: Request) {
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

  const id = `mem_${nanoid(10)}`;
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
    id,
    name: String(body.name).slice(0, 100),
    email: String(body.email).slice(0, 100),
    title: body.title?.trim() ? String(body.title).slice(0, 200) : undefined,
    date: body.date ?? new Date().toISOString(),
    body: String(body.body).slice(0, 5000),
    photos: photos.map((p, i) => ({
      public_id: p.public_id,
      caption: p.caption ?? '',
      taken_at: p.taken_at ?? null,
      sort_index: i,
    })),
  };

  // Write detail first
  await writeMemory(detail);

  // Update index (prepend)
  const index = await readIndex();
  const coverPublicId = detail.photos[0]?.public_id;
  const nextIndex = [
    {
      id: detail.id,
      title: detail.title || detail.name, // Use title if provided, otherwise use name
      date: detail.date,
      cover_url: coverPublicId ? cldUrl(coverPublicId, { w: 1200 }) : undefined,
      photo_count: detail.photos.length,
    },
    ...index,
  ].slice(0, 500); // keep it small
  await writeIndex(nextIndex);

  // Invalidate cache
  revalidatePath('/');
  revalidatePath('/memories');
  revalidatePath('/memories/[id]', 'page');
  revalidatePath('/photos');

  return Response.json({ id: detail.id }, { status: 201 });
}
