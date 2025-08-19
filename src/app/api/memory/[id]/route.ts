import {
  readMemory,
  immutableUpdateMemory,
  deleteMemory,
  readBlobJson,
} from '@/lib/data';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const fresh = searchParams.get('fresh') === '1';
    const t = searchParams.get('t') || undefined;

    console.log('Attempting to fetch memory:', id, 'fresh:', fresh);

    // Try current id
    let doc = await readMemory(id, { forceFresh: fresh, updated_at: t });

    // If missing, check redirect pointer
    if (!doc) {
      const ptr = await readBlobJson<{ id: string; updated_at?: string }>(
        `redirects/${id}.json`,
        { forceFresh: true }
      );
      if (ptr?.id) {
        console.log('Found redirect pointer:', id, '->', ptr.id);
        doc = await readMemory(ptr.id, {
          forceFresh: fresh,
          updated_at: t || ptr.updated_at,
        });
      }
    }

    if (!doc) {
      console.log('Memory not found:', id);
      return new Response('Not found', { status: 404 });
    }

    console.log('Successfully fetched memory:', id);
    const response = Response.json(doc);
    response.headers.set(
      'Cache-Control',
      fresh ? 'no-store' : 's-maxage=60, stale-while-revalidate=300'
    );
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

    // Read the memory to verify it exists
    const memory = await readMemory(id);
    if (!memory) {
      return new Response('Memory not found', { status: 404 });
    }

    // TODO: Add authentication/authorization here
    // For now, allow deletion (we'll add proper auth later)

    // Delete the memory detail file and index item
    await deleteMemory(id);

    // TODO: Delete photos from Cloudinary
    // For now, just remove from index and memory file

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting memory:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
