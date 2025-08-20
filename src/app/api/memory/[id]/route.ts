import {
  readMemory,
  immutableUpdateMemory,
  deleteMemoryAndIndex,
  readBlobJson,
} from '@/lib/data';
import { del } from '@vercel/blob';
import {
  warmUpImages,
  getHeroImageUrl,
  getGridImageUrl,
} from '@/lib/cloudinary';
import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

const k = (key: string) =>
  process.env.BLOB_PREFIX ? `${process.env.BLOB_PREFIX}/${key}` : key;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const t = searchParams.get('t') || undefined;

    console.log('Attempting to fetch memory:', id, 't:', t);

    // Try current id
    let doc = await readMemory(id, { forceFresh: true, updated_at: t });
    console.log('Tried to read memory directly:', id, 'found:', !!doc);

    // If missing, check redirect pointer
    if (!doc) {
      console.log(
        'Memory not found directly, checking redirect pointer for:',
        id
      );
      const ptr = await readBlobJson<{ id: string; updated_at?: string }>(
        `redirects/${id}.json`,
        { forceFresh: true }
      );
      console.log('Redirect pointer result:', ptr);
      if (ptr?.id) {
        console.log('Found redirect pointer:', id, '->', ptr.id);
        doc = await readMemory(ptr.id, {
          forceFresh: true,
          updated_at: t || ptr.updated_at,
        });
        console.log('Read memory via redirect:', ptr.id, 'found:', !!doc);
      }
    }

    if (!doc) {
      console.log('Memory not found:', id);
      return new Response('Not found', { status: 404 });
    }

    console.log(
      'Successfully fetched memory:',
      id,
      'photos:',
      doc.photos?.length,
      'photo IDs:',
      doc.photos?.map((p) => p.public_id).slice(0, 3)
    );
    const response = Response.json(doc);
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    console.error('Error fetching memory:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => null);

    if (!body) {
      return new Response('Invalid request body', { status: 400 });
    }

    // TODO: Add authentication/authorization here
    // For now, allow editing (we'll add proper auth later)

    // Prepare changes for immutable update
    const changes = {
      name: String(body.name).slice(0, 100),
      email: String(body.email).slice(0, 100),
      title: body.title?.trim() ? String(body.title).slice(0, 200) : undefined,
      body: String(body.body).slice(0, 5000),
      photos: (body.photos || []).map((p: any, i: number) => ({
        public_id: p.public_id,
        caption: p.caption ?? '',
        taken_at: p.taken_at ?? null,
        sort_index: i,
      })),
    };

    // Perform immutable update (creates new memory, deletes old one)
    const updatedMemory = await immutableUpdateMemory(id, changes);

    // Warm up the most important image URLs for faster first view
    if (updatedMemory.photos.length > 0) {
      const warmUpUrls = [
        // Hero image (first photo)
        getHeroImageUrl(updatedMemory.photos[0].public_id),
        // Grid images (first few photos)
        ...updatedMemory.photos
          .slice(0, 3)
          .map((photo) => getGridImageUrl(photo.public_id)),
      ];

      // Fire off warm-up requests in background (don't await)
      warmUpImages(warmUpUrls);
      console.log(
        'Warming up',
        warmUpUrls.length,
        'image URLs for updated memory'
      );
    }

    // Re-index photos
    revalidateTag('photos-index');

    return Response.json({
      id: updatedMemory.id,
      updated_at: updatedMemory.updated_at,
    });
  } catch (error) {
    console.error('Error updating memory:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log('Attempting to delete memory:', id);

    // Try to read the memory directly first
    let memory = await readMemory(id);
    let actualId = id;

    // If not found, check for redirect pointer
    if (!memory) {
      console.log(
        'Memory not found directly, checking redirect pointer for:',
        id
      );
      const ptr = await readBlobJson<{ id: string; updated_at?: string }>(
        `redirects/${id}.json`,
        { forceFresh: true }
      );
      if (ptr?.id) {
        console.log('Found redirect pointer:', id, '->', ptr.id);
        memory = await readMemory(ptr.id);
        actualId = ptr.id;
      }
    }

    if (!memory) {
      console.log('Memory not found:', id);
      return new Response('Memory not found', { status: 404 });
    }

    console.log('Found memory to delete:', actualId);

    // TODO: Add authentication/authorization here
    // For now, allow deletion (we'll add proper auth later)

    // Delete the memory detail file and index item
    await deleteMemoryAndIndex(actualId);

    // Also delete the redirect pointer if it exists
    if (actualId !== id) {
      const token =
        process.env.BLOB_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
      if (token) {
        await del(k(`redirects/${id}.json`), { token }).catch(() => {});
        console.log('Deleted redirect pointer:', id);
      }
    }

    // TODO: Delete photos from Cloudinary
    // For now, just remove from index and memory file
    // Re-index photos
    revalidateTag('photos-index');

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting memory:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
