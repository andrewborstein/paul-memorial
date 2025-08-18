import { readIndex, readMemory } from '@/lib/data';

export const revalidate = 60;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string[] }> }
) {
  const { id } = await params;
  const photoId = id.join('/'); // Join the segments back together

  try {
    // Get all memories
    const memories = await readIndex();

    // Find the memory that contains this photo
    for (const memoryItem of memories) {
      const memory = await readMemory(memoryItem.id);
      if (!memory) continue;

      const photo = memory.photos.find((p) => p.public_id === photoId);
      if (photo) {
        const photoIndex = memory.photos.findIndex(
          (p) => p.public_id === photoId
        );
        return Response.json({
          memory,
          photo,
          photoIndex,
        });
      }
    }

    return new Response('Photo not found', { status: 404 });
  } catch (error) {
    console.error('Error finding photo:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
