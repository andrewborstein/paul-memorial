import { readIndex, writeIndex, readMemory, writeMemory, deleteMemory } from '@/lib/data';
import { revalidatePath } from 'next/cache';

export const revalidate = 60;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('Attempting to fetch memory:', id);

    const doc = await readMemory(id);
    if (!doc) {
      console.log('Memory not found:', id);
      return new Response('Not found', { status: 404 });
    }

    console.log('Successfully fetched memory:', id);
    return Response.json(doc, {
      headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' },
    });
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

    // Read existing memory
    const existingMemory = await readMemory(id);
    if (!existingMemory) {
      return new Response('Memory not found', { status: 404 });
    }

    // TODO: Add authentication/authorization here
    // For now, allow editing (we'll add proper auth later)

    // Update memory with new data
    const updatedMemory = {
      ...existingMemory,
      name: String(body.name).slice(0, 100),
      email: String(body.email).slice(0, 100),
      title: body.title?.trim() ? String(body.title).slice(0, 200) : undefined,
      date: body.date ?? existingMemory.date,
      body: String(body.body).slice(0, 5000),
      photos: (body.photos || []).map((p: any, i: number) => ({
        public_id: p.public_id,
        caption: p.caption ?? '',
        taken_at: p.taken_at ?? null,
        sort_index: i,
      })),
    };

    // Write updated memory
    await writeMemory(updatedMemory);

    // Update index
    const index = await readIndex();
    const coverPublicId = updatedMemory.photos[0]?.public_id;
    const updatedIndex = index.map(item => 
      item.id === id 
        ? {
            id: updatedMemory.id,
            title: updatedMemory.title || updatedMemory.name,
            date: updatedMemory.date,
            cover_public_id: coverPublicId,
            photo_count: updatedMemory.photos.length,
          }
        : item
    );
    await writeIndex(updatedIndex);

    // Invalidate cache
    revalidatePath('/');
    revalidatePath('/memories');
    revalidatePath('/memories/[id]', 'page');
    revalidatePath('/photos');

    return Response.json({ id: updatedMemory.id });
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
    
    // Read the memory to verify it exists
    const memory = await readMemory(id);
    if (!memory) {
      return new Response('Memory not found', { status: 404 });
    }

    // TODO: Add authentication/authorization here
    // For now, allow deletion (we'll add proper auth later)

    // Remove from index
    const index = await readIndex();
    const updatedIndex = index.filter(m => m.id !== id);
    await writeIndex(updatedIndex);

    // Delete the memory detail file
    await deleteMemory(id);

    // TODO: Delete photos from Cloudinary
    // For now, just remove from index and memory file

    // Invalidate cache aggressively
    revalidatePath('/');
    revalidatePath('/memories');
    revalidatePath('/memories/[id]', 'page');
    revalidatePath('/photos');
    revalidatePath('/api/memories');
    revalidatePath('/api/memory/[id]', 'page');

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting memory:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
