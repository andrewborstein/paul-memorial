import { aggregateIndex, readMemory } from '@/lib/data';

export const revalidate = 60;

// Cache for photo lookups to avoid repeated database scans
const photoCache = new Map<string, any>();

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string[] }> }
) {
  const { id } = await params;
  const photoId = id.join('/'); // Join the segments back together

  // Check cache first
  if (photoCache.has(photoId)) {
    return Response.json(photoCache.get(photoId));
  }

  try {
    // Get all memories
    const memories = await aggregateIndex();

    // Find the memory that contains this photo
    for (const memoryItem of memories) {
      const memory = await readMemory(memoryItem.id);
      if (!memory) continue;

      const photo = memory.photos.find((p) => p.public_id === photoId);
      if (photo) {
        const photoIndex = memory.photos.findIndex(
          (p) => p.public_id === photoId
        );
        const result = {
          memory,
          photo,
          photoIndex,
        };

        // Cache the result
        photoCache.set(photoId, result);

        return Response.json(result);
      }
    }

    return new Response('Photo not found', { status: 404 });
  } catch (error) {
    console.error('Error finding photo:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
